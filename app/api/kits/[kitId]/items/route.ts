import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ kitId: string }> }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { householdId } = user;
  const { kitId } = await params;

  try {
    const client = await pool.connect();
    try {
      // Verify that the kit belongs to the user's household
      const kitCheck = await client.query(
        `SELECT k.user_id
         FROM kits k
         JOIN users u ON k.user_id = u.id
         WHERE k.id = $1 AND u.household_id = $2`,
        [kitId, householdId]
      );

      if (kitCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Kit not found or access denied' }, { status: 404 });
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
