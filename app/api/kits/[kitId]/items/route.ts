import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { kitId: string } }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  const { kitId } = params;

  try {
    const client = await pool.connect();
    try {
      // First, verify that the kit belongs to the user
      const kitCheck = await client.query('SELECT user_id FROM kits WHERE id = $1', [kitId]);
      if (kitCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
      }
      if (kitCheck.rows[0].user_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Fetch the items associated with the kit
      const result = await client.query(
        `SELECT i.*, ki.quantity
         FROM inventory_items i
         JOIN kit_items ki ON i.id = ki.item_id
         WHERE ki.kit_id = $1`,
        [kitId]
      );
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error fetching items for kit ${kitId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}