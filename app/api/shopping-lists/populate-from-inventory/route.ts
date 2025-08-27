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
    await client.query('BEGIN');

    // 1. Get the user's default shopping list (or create one)
    let shoppingListResult = await client.query('SELECT * FROM shopping_lists WHERE user_id = $1', [userId]);
    if (shoppingListResult.rows.length === 0) {
      shoppingListResult = await client.query(
        'INSERT INTO shopping_lists (user_id, name) VALUES ($1, $2) RETURNING *',
        [userId, 'My Shopping List']
      );
    }
    const shoppingListId = shoppingListResult.rows[0].id;

    // 2. Find low-stock OR expiring inventory items
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const itemsToFlagResult = await client.query(
      `SELECT * FROM inventory_items
       WHERE user_id = $1 AND (quantity <= min_stock OR (expiry_date IS NOT NULL AND expiry_date <= $2))`,
      [userId, thirtyDaysFromNow]
    );
    const itemsToFlag = itemsToFlagResult.rows;

    if (itemsToFlag.length === 0) {
      await client.query('COMMIT');
      return NextResponse.json({ message: 'No items to add to your shopping list.' });
    }

    // 3. Get existing items on the shopping list to avoid duplicates
    const existingShoppingItemsResult = await client.query(
      'SELECT inventory_item_id FROM shopping_list_items WHERE shopping_list_id = $1 AND inventory_item_id IS NOT NULL AND is_purchased = false',
      [shoppingListId]
    );
    const existingInventoryItemIds = new Set(existingShoppingItemsResult.rows.map(row => row.inventory_item_id));

    let itemsAddedCount = 0;
    // 4. Add new items to the shopping list with a reason
    for (const item of itemsToFlag) {
      if (!existingInventoryItemIds.has(item.id)) {
        let reason = 'low-stock';
        if (item.quantity <= 0) {
          reason = 'out-of-stock';
        } else if (item.expiry_date && new Date(item.expiry_date) <= thirtyDaysFromNow) {
          reason = 'expiring';
        }

        const quantityToOrder = item.min_stock > item.quantity ? item.min_stock - item.quantity : 1;

        await client.query(
          `INSERT INTO shopping_list_items
           (shopping_list_id, item_name, quantity, is_purchased, inventory_item_id, category, estimated_cost, preferred_store, reason)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            shoppingListId,
            item.name,
            quantityToOrder,
            false,
            item.id,
            item.category,
            item.cost_per_unit ? item.cost_per_unit * quantityToOrder : null,
            item.supplier,
            reason
          ]
        );
        itemsAddedCount++;
      }
    }

    await client.query('COMMIT');

    return NextResponse.json({ message: `${itemsAddedCount} item(s) added to your shopping list.` });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error populating shopping list from inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
