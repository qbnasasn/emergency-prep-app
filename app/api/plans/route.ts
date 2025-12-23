import { NextResponse } from 'next/server';
// Using the centralized pool from lib/db
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

const MAX_PLANS_SCOUT = 2;

export async function GET() {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { householdId } = user;

    try {
        const client = await pool.connect();
        // Scope by Household
        // Plans don't have a household_id directly, so we join with users
        const result = await client.query(
            `SELECT p.*
       FROM plans p
       JOIN users u ON p.user_id = u.id
       WHERE u.household_id = $1
       ORDER BY p.is_active DESC, p.created_at DESC`,
            [householdId]
        );
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching plans:', error);
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
        const { id, name, description, hazard_type, is_active, updated_at } = await req.json();
        if (!name || !hazard_type) {
            return NextResponse.json({ error: 'Plan name and hazard type are required' }, { status: 400 });
        }

        const client = await pool.connect();

        try {
            // Enforce Scout Plan Limit (Only if creating NEW plan)
            if (subscriptionPlan === 'scout') {
                if (!householdId) {
                    return NextResponse.json({ error: 'Household context missing' }, { status: 400 });
                }

                // Check if plan exists already (Edit Mode)
                let existing = null;
                if (id) {
                    const check = await client.query('SELECT id FROM plans WHERE id = $1', [id]);
                    existing = check.rows[0];
                }

                if (!existing) {
                    // Count plans for the entire household
                    const countResult = await client.query(
                        `SELECT COUNT(p.*)
                         FROM plans p
                         JOIN users u ON p.user_id = u.id
                         WHERE u.household_id = $1`,
                        [householdId]
                    );
                    const count = parseInt(countResult.rows[0].count, 10);

                    if (count >= MAX_PLANS_SCOUT) {
                        return NextResponse.json({ error: 'Scout plan limited to 2 emergency plans.' }, { status: 403 });
                    }
                }
            }

            // UPSERT Logic
            // If ID is provided, use it. If not, let DB generate (but we should really use one if we want to be clean).
            // For Postgres, if ID is omitted, we'd need separate query.
            // But standardizing on "Client Generated UUID" is best for sync.
            // If `id` is missing (Web API usage?), we can let Postgres default if column has default, OR we generate one here.

            let query = '';
            let params = [];

            if (id) {
                query = `
                    INSERT INTO plans (id, user_id, name, description, hazard_type, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        hazard_type = EXCLUDED.hazard_type,
                        is_active = EXCLUDED.is_active
                    RETURNING *
                `;
                params = [id, userId, name, description, hazard_type, is_active];
            } else {
                query = `
                    INSERT INTO plans (user_id, name, description, hazard_type, is_active)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *
                `;
                params = [userId, name, description, hazard_type, is_active];
            }

            const result = await client.query(query, params);
            return NextResponse.json(result.rows[0], { status: 201 });
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
