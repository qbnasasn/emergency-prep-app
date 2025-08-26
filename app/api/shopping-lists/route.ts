import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const client = await pool.connect();

  try {
    // Find user's shopping list
    let result = await client.query('SELECT * FROM shopping_lists WHERE user_id = $1', [userId]);

    // If no list exists, create one
    if (result.rows.length === 0) {
      result = await client.query(
        'INSERT INTO shopping_lists (user_id, name) VALUES ($1, $2) RETURNING *',
        [userId, 'My Shopping List']
      );
    }

    // For now, we assume one list per user. Return the first one found or created.
    const shoppingList = result.rows[0];

    // Now, get the items for that list
    const itemsResult = await client.query(
        'SELECT * FROM shopping_list_items WHERE shopping_list_id = $1 ORDER BY is_purchased ASC',
        [shoppingList.id]
    );

    return NextResponse.json({ ...shoppingList, items: itemsResult.rows });

  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
