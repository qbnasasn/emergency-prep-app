import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"
import Papa from 'papaparse';

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileContent = await file.text();

    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const items = parsed.data as any[];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const item of items) {
        const { name, description, quantity, category, location, supplier, cost_per_unit, purchase_date, expiry_date, min_stock, calories, upc } = item;

        await client.query(
          `INSERT INTO inventory_items (user_id, name, description, quantity, category, location, supplier, cost_per_unit, purchase_date, expiry_date, min_stock, calories, upc)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [userId, name, description, quantity, category, location, supplier, cost_per_unit, purchase_date, expiry_date, min_stock, calories, upc]
        );
      }

      await client.query('COMMIT');
      return NextResponse.json({ message: 'Import successful' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error importing inventory:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
