import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

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
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      name,
      description,
      quantity,
      is_food_item,
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
    } = body;

    // Validation
    if (!name || quantity === undefined || !category) {
      return NextResponse.json({ error: 'Missing required fields: name, quantity, and category are required.' }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO inventory_items (
        user_id, name, description, quantity, is_food_item, expiry_date, category,
        location, min_stock, cost_per_unit, purchase_date, calories, supplier, upc, image
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;

    const values = [
      session.user.id,
      name,
      description || null,
      quantity,
      is_food_item || false,
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
    ];

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
