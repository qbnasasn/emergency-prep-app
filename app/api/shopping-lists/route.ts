import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;
  const householdId = user.householdId;
  const client = await pool.connect();

  try {
    // Find household's shopping list
    // We join with users to check if the list owner is in the same household
    let result = await client.query(
      `SELECT sl.*
       FROM shopping_lists sl
       JOIN users u ON sl.user_id = u.id
       WHERE u.household_id = $1`,
      [householdId]
    );

    // If no list exists for the household, create one
    if (result.rows.length === 0) {
      result = await client.query(
        'INSERT INTO shopping_lists (user_id, name) VALUES ($1, $2) RETURNING *',
        [userId, 'My Shopping List']
      );
    }

    // For now, we assume one list per household. Return the first one found or created.
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
