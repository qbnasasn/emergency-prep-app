import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const client = await pool.connect();
  try {
    const { shoppingListItemId } = await req.json();

    if (!shoppingListItemId) {
      return NextResponse.json({ error: 'shoppingListItemId is required' }, { status: 400 });
    }

    await client.query('BEGIN');

    // 1. Find the shopping list item and its linked inventory item id
    const shoppingItemResult = await client.query(
      `SELECT sli.quantity, sli.inventory_item_id
       FROM shopping_list_items sli
       JOIN shopping_lists sl ON sli.shopping_list_id = sl.id
       WHERE sli.id = $1 AND sl.user_id = $2`,
      [shoppingListItemId, userId]
    );

    if (shoppingItemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Shopping list item not found or user not authorized' }, { status: 404 });
    }

    const { quantity: restockQuantity, inventory_item_id: inventoryItemId } = shoppingItemResult.rows[0];

    if (!inventoryItemId) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'This shopping item is not linked to an inventory item. Use the move-to-inventory endpoint instead.' }, { status: 400 });
    }

    // 2. Update the quantity of the inventory item
    await client.query(
      'UPDATE inventory_items SET quantity = quantity + $1 WHERE id = $2 AND user_id = $3',
      [restockQuantity, inventoryItemId, userId]
    );

    // 3. Delete the item from the shopping_list_items table
    await client.query('DELETE FROM shopping_list_items WHERE id = $1', [shoppingListItemId]);

    await client.query('COMMIT');

    return NextResponse.json({ message: 'Inventory item restocked successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error restocking item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
