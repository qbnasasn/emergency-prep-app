import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function PUT(req: Request, { params }: { params: { listId: string, itemId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { listId, itemId } = params;

  try {
    const body = await req.json();

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

export async function DELETE(req: Request, { params }: { params: { listId: string, itemId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { listId, itemId } = params;

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
