import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

const MAX_ITEMS_SCOUT = 50;

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const householdId = user.householdId;

  if (!householdId) {
      return NextResponse.json({ error: 'Household context missing' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM inventory_items WHERE household_id = $1', [householdId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
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

  if (!householdId) {
      return NextResponse.json({ error: 'Household context missing' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const client = await pool.connect();

    try {
        const itemsToInsert = Array.isArray(body) ? body : [body];

        // Enforce Plan Limits (Check count once)
        if (subscriptionPlan === 'scout') {
            const countResult = await client.query(
                'SELECT COUNT(*) FROM inventory_items WHERE household_id = $1',
                [householdId]
            );
            const currentCount = parseInt(countResult.rows[0].count, 10);
            if (currentCount + itemsToInsert.length > MAX_ITEMS_SCOUT) {
                 return NextResponse.json(
                    { error: 'Plan limit reached. Upgrade to Prepper Pro for unlimited storage.' },
                    { status: 403 }
                );
            }
        }

        await client.query('BEGIN');
        const results = [];

        for (const item of itemsToInsert) {
             const {
              name, description, quantity, expiry_date, category, location,
              min_stock, cost_per_unit, purchase_date, calories, supplier, upc, image, nutrition_type
            } = item;

            if (!name || quantity === undefined || !category) {
                 throw new Error('Missing required fields: name, quantity, and category are required.');
            }

            const insertQuery = `
              INSERT INTO inventory_items (
                user_id, household_id, name, description, quantity, expiry_date, category,
                location, min_stock, cost_per_unit, purchase_date, calories, supplier, upc, image, nutrition_type
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
              RETURNING *;
            `;

            const values = [
              userId,
              householdId,
              name,
              description || null,
              quantity,
              expiry_date || null,
              category,
              location || null,
              min_stock || null,
              cost_per_unit || null,
              purchase_date || null,
              calories || null,
              supplier || null,
              upc || null,
              image || null,
              nutrition_type || null,
            ].map(val => val === "" ? null : val);

            const res = await client.query(insertQuery, values);
            results.push(res.rows[0]);
        }

        await client.query('COMMIT');

        if (Array.isArray(body)) {
            return NextResponse.json(results, { status: 201 });
        } else {
            return NextResponse.json(results[0], { status: 201 });
        }

    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }

  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Internal Server Error or Invalid Data' }, { status: 500 });
  }
}
