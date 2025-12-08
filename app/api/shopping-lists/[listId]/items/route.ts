import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

const MAX_SHOPPING_ITEMS_SCOUT = 10;

export async function POST(req: Request, { params }: { params: Promise<{ listId: string }> }) {
  // params is a Promise in Next.js 15
  const { listId } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  const householdId = user.householdId;
  const subscriptionPlan = user.subscriptionPlan;

  try {
    const body = await req.json();
    const { item_name, quantity, category, estimated_cost, preferred_store } = body;

    if (!item_name || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields: item_name and quantity' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Verify user's household owns the shopping list
      const listCheckResult = await client.query(
        `SELECT u.household_id
         FROM shopping_lists sl
         JOIN users u ON sl.user_id = u.id
         WHERE sl.id = $1`,
        [listId]
      );

      if (listCheckResult.rows.length === 0) {
        return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
      }

      if (listCheckResult.rows[0].household_id !== householdId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Enforce Scout Plan Limit
      if (subscriptionPlan === 'scout') {
          const countResult = await client.query(
              'SELECT COUNT(*) FROM shopping_list_items WHERE shopping_list_id = $1',
              [listId]
          );
          const count = parseInt(countResult.rows[0].count, 10);

          if (count >= MAX_SHOPPING_ITEMS_SCOUT) {
              return NextResponse.json({ error: 'Plan limit reached. Upgrade to Prepper Pro for unlimited items.' }, { status: 403 });
          }
      }

      // Insert the new item
      const result = await client.query(
        `INSERT INTO shopping_list_items
         (shopping_list_id, item_name, quantity, category, estimated_cost, preferred_store, is_purchased)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          listId,
          item_name,
          quantity,
          category || null,
          estimated_cost || null,
          preferred_store || null,
          false
        ]
      );

      return NextResponse.json(result.rows[0], { status: 201 });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error adding item to shopping list ${listId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
