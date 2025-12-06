import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth";
import { Resend } from 'resend';

// Helper to generate 6-char random code
function generateCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({
      subscriptionPlan: user.subscriptionPlan,
      householdId: user.householdId,
      canInvite: user.subscriptionPlan === 'family_plan'
  });
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

  // Get recipient email from body
  let recipientEmail: string | undefined;
  try {
      const body = await req.json();
      recipientEmail = body.email;
  } catch (e) {
      // Ignore if no body/json
  }

  const client = await pool.connect();
  try {
    // 1. Enforce Limit (Max 5 members)
    const countRes = await client.query(
        'SELECT COUNT(*) FROM users WHERE household_id = $1',
        [householdId]
    );
    const memberCount = parseInt(countRes.rows[0].count, 10);
    if (memberCount >= 5) {
        return NextResponse.json({ error: 'Household limit reached (Max 5 members)' }, { status: 403 });
    }

    const code = generateCode(6);
    // Expiration: 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Database Insert
    const result = await client.query(
      'INSERT INTO household_invites (household_id, code, expires_at) VALUES ($1, $2, $3) RETURNING code, expires_at',
      [householdId, code, expiresAt.toISOString()]
    );

    const generatedCode = result.rows[0].code;
    let emailSent = false;

    // 2. Send Email (Optional)
    if (recipientEmail) {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
            const resend = new Resend(apiKey);
            try {
                await resend.emails.send({
                    from: 'Prepper Family <familylink@prepsafe.app>',
                    to: recipientEmail,
                    subject: "You've been invited to join a Prepper Family",
                    html: `
                        <div style="font-family: sans-serif; color: #333;">
                            <h2>You've been invited!</h2>
                            <p>You have been invited to join a household on PrepSafe.</p>
                            <p>Your invite code is: <strong>${generatedCode}</strong></p>
                            <p>This code expires in 24 hours.</p>
                            <hr />
                            <p style="font-size: 12px; color: #666;">
                                <a href="https://prepsafe.app">Open PrepSafe</a>
                            </p>
                        </div>
                    `
                });
                emailSent = true;
            } catch (emailError) {
                console.error("Failed to send invite email:", emailError);
                // We don't fail the request, just log it.
            }
        }
    }

    return NextResponse.json({
        code: generatedCode,
        expiresAt: result.rows[0].expires_at,
        emailSent
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
                'SELECT household_id FROM household_invites WHERE code = UPPER($1) AND expires_at > NOW()',
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
            // Upgrade to 'prepper_pro' to bypass Scout limits
            await client.query(
                "UPDATE users SET household_id = $1, subscription_plan = 'prepper_pro' WHERE id = $2",
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
