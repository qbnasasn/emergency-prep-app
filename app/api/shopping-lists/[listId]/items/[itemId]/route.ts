import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: Promise<{ listId: string, itemId: string }> }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // params is a Promise in Next.js 15
  const { listId, itemId } = await params;
  const householdId = user.householdId;

  try {
    const body = await req.json();

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

      const fields = [
        'item_name', 'quantity', 'is_purchased', 'category',
        'estimated_cost', 'preferred_store'
      ];

      const setClauses: string[] = [];
      const values: any[] = [];
      let valueCount = 1;

      fields.forEach(field => {
          if (body[field] !== undefined) {
              setClauses.push(`${field} = $${valueCount++}`);
              values.push(body[field]);
          }
      });

      if (setClauses.length === 0) {
          return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
      }

      values.push(itemId, listId);

      const updateQuery = `
        UPDATE shopping_list_items
        SET ${setClauses.join(', ')}
        WHERE id = $${valueCount++} AND shopping_list_id = $${valueCount++}
        RETURNING *;
      `;

      const result = await client.query(updateQuery, values);

      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Shopping list item not found' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);

    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error updating item ${itemId} in shopping list ${listId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ listId: string, itemId: string }> }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // params is a Promise in Next.js 15
  const { listId, itemId } = await params;
  const householdId = user.householdId;

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

    // Delete the item
    await client.query('DELETE FROM shopping_list_items WHERE id = $1 AND shopping_list_id = $2', [itemId, listId]);

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    console.error(`Error deleting item ${itemId} from shopping list ${listId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
