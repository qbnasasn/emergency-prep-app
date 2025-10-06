import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function POST(req: Request, { params }: { params: { listId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const listId = params.listId;

  try {
    const body = await req.json();
    const { item_name, quantity, category, estimated_cost, preferred_store } = body;

    if (!item_name || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields: item_name and quantity' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Verify user owns the shopping list
      const listCheckResult = await client.query(
        'SELECT user_id FROM shopping_lists WHERE id = $1',
        [listId]
      );

      if (listCheckResult.rows.length === 0) {
        return NextResponse.json({ error: 'Shopping list not found' }, { status: 404 });
      }

      if (listCheckResult.rows[0].user_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
