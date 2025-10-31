import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import Papa from 'papaparse';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM inventory_items WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      const items = result.rows;

      if (items.length === 0) {
        return new NextResponse('No inventory items to export.', { status: 200, headers: { 'Content-Type': 'text/plain' } });
      }

      const csv = Papa.unparse(items);

      const headers = new Headers();
      headers.set('Content-Type', 'text/csv');
      headers.set('Content-Disposition', 'attachment; filename="inventory.csv"');

      return new NextResponse(csv, { status: 200, headers });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error exporting inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
