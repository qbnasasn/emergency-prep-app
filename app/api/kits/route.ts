import { NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/auth"
import { getKits } from '@/lib/data/kits';
import pool from '@/lib/db';

const MAX_KITS_SCOUT = 1;

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { householdId } = user;

  if (!householdId) {
      return NextResponse.json({ error: 'Household context missing' }, { status: 400 });
  }

  try {
    const kits = await getKits(householdId);
    return NextResponse.json(kits);
  } catch (error) {
    console.error('Error fetching kits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const householdId = user.householdId;
    const subscriptionPlan = user.subscriptionPlan;

    try {
        const body = await req.json();
        const { name, description, gps_location } = body;

        if (!name) {
             return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            if (subscriptionPlan === 'scout') {
                if (!householdId) {
                     return NextResponse.json({ error: 'Household context missing' }, { status: 400 });
                }

                const countResult = await client.query(
                    `SELECT COUNT(k.*)
                     FROM kits k
                     JOIN users u ON k.user_id = u.id
                     WHERE u.household_id = $1`,
                    [householdId]
                );
                const count = parseInt(countResult.rows[0].count, 10);

                if (count >= MAX_KITS_SCOUT) {
                    return NextResponse.json({ error: 'Scout plan limited to 1 custom kit. Upgrade to create more.' }, { status: 403 });
                }
            }

            const result = await client.query(
                'INSERT INTO kits (user_id, name, description, gps_location) VALUES ($1, $2, $3, $4) RETURNING *',
                [userId, name, description, gps_location]
            );
            return NextResponse.json(result.rows[0], { status: 201 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error creating kit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
