import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(req: Request, { params }: { params: { listId: string, itemId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { listId, itemId } = params;

  try {
    const body = await req.json();
    const { is_purchased } = body;

    if (is_purchased === undefined) {
      return NextResponse.json({ error: 'Missing is_purchased field' }, { status: 400 });
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

      // Update the item
      const result = await client.query(
        'UPDATE shopping_list_items SET is_purchased = $1 WHERE id = $2 AND shopping_list_id = $3 RETURNING *',
        [is_purchased, itemId, listId]
      );

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
