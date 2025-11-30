import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM inventory_items WHERE user_id = $1', [userId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  try {
    const body = await req.json();
    const {
      name,
      description,
      quantity,
      expiry_date,
      category,
      location,
      min_stock,
      cost_per_unit,
      purchase_date,
      calories,
      supplier,
      upc,
      image,
      nutrition_type,
    } = body;

    // Validation
    if (!name || quantity === undefined || !category) {
      return NextResponse.json({ error: 'Missing required fields: name, quantity, and category are required.' }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO inventory_items (
        user_id, name, description, quantity, expiry_date, category,
        location, min_stock, cost_per_unit, purchase_date, calories, supplier, upc, image, nutrition_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      userId,
      name,
      description || null,
      quantity,
      expiry_date || null,
      category,
      location || null,
      min_stock || null,
      cost_per_unit || null,
      purchase_date || null,
      calories || null,
      supplier || null,
      upc || null,
      image || null,
      nutrition_type || null,
    ].map(val => val === "" ? null : val);

    const client = await pool.connect();
    try {
        const result = await client.query(insertQuery, values);
        return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
        client.release();
    }

  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
