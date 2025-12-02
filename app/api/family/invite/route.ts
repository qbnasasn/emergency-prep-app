import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth";

// Helper to generate 6-char random code
function generateCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Plan Check
  if (user.subscriptionPlan !== 'family_plan') {
    return NextResponse.json({ error: 'Upgrade to Family Plan to invite members.' }, { status: 403 });
  }

  const householdId = user.householdId;
  if (!householdId) return NextResponse.json({ error: 'Household context missing' }, { status: 400 });

  const code = generateCode(6);
  // Expiration: 24 hours from now
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const client = await pool.connect();
  try {
    // Database Insert
    // Note: 'created_by' column was not created in the schema migration, so it is omitted here.
    const result = await client.query(
      'INSERT INTO household_invites (household_id, code, expires_at) VALUES ($1, $2, $3) RETURNING code, expires_at',
      [householdId, code, expiresAt.toISOString()]
    );

    return NextResponse.json({
        code: result.rows[0].code,
        expiresAt: result.rows[0].expires_at
    });
  } catch (error) {
      console.error('Error generating invite:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
      client.release();
  }
}

export async function PUT(req: Request) {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { code } = body;

        if (!code) return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Validate Code
            const inviteRes = await client.query(
                'SELECT household_id FROM household_invites WHERE code = $1 AND expires_at > NOW()',
                [code]
            );

            if (inviteRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Invalid or expired invite code' }, { status: 404 });
            }

            const targetHouseholdId = inviteRes.rows[0].household_id;

            // Optional: Check if already in this household
            if (targetHouseholdId === user.householdId) {
                await client.query('ROLLBACK');
                return NextResponse.json({ message: 'You are already in this household' }, { status: 200 });
            }

            // Update User
            await client.query(
                'UPDATE users SET household_id = $1 WHERE id = $2',
                [targetHouseholdId, user.id]
            );

            // Update Data (Inventory Items)
            await client.query(
                'UPDATE inventory_items SET household_id = $1 WHERE user_id = $2',
                [targetHouseholdId, user.id]
            );

            await client.query('COMMIT');
            return NextResponse.json({ message: 'Successfully joined household' });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error accepting invite:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
