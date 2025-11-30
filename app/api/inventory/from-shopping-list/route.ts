import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  const client = await pool.connect();
  try {
    const { shoppingListItemId } = await req.json();

    if (!shoppingListItemId) {
      return NextResponse.json({ error: 'shoppingListItemId is required' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Find the shopping list item and verify ownership
    const shoppingItemResult = await client.query(
      `SELECT sli.*, sl.user_id FROM shopping_list_items sli
       JOIN shopping_lists sl ON sli.shopping_list_id = sl.id
       WHERE sli.id = $1 AND sl.user_id = $2`,
      [shoppingListItemId, userId]
    );

    if (shoppingItemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Shopping list item not found or user not authorized' }, { status: 404 });
    }
    const shoppingItem = shoppingItemResult.rows[0];

    // 2. Create a new item in the inventory_items table
    const insertQuery = `
      INSERT INTO inventory_items (user_id, name, quantity, category)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      userId,
      shoppingItem.item_name,
      shoppingItem.quantity,
      shoppingItem.category || 'Miscellaneous', // Default category if not present
    ];
    await client.query(insertQuery, values);

    // 3. Delete the item from the shopping_list_items table
    await client.query('DELETE FROM shopping_list_items WHERE id = $1', [shoppingListItemId]);

    await client.query('COMMIT');

    return NextResponse.json({ message: 'Item moved to inventory successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error moving item to inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
