import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { sendNotification } from '@/lib/notifications';

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
      session.user.id,
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
        const newItem = result.rows[0];

        console.log(`Inventory item created: ${newItem.id}. Checking alerts... Quantity: ${quantity}, Min: ${min_stock}`);

        // Check for low stock alert
        if (min_stock !== null && quantity <= min_stock) {
          console.log(`Triggering low stock alert for ${newItem.name}`);
          await sendNotification(
            session.user.id,
            'Low Stock Alert',
            `Your inventory item "${name}" is low on stock (${quantity} remaining, min: ${min_stock}).`,
            'inventory',
            '/dashboard/inventory'
          );
        }

        return NextResponse.json(newItem, { status: 201 });
    } finally {
        client.release();
    }

  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
