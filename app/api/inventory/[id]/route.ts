import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const itemId = params.id;
  const userId = session.user.id;

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

    const client = await pool.connect();
    try {
        const checkResult = await client.query('SELECT user_id FROM inventory_items WHERE id = $1', [itemId]);
        if (checkResult.rows.length === 0) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        if (checkResult.rows[0].user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updateQuery = `
          UPDATE inventory_items
          SET
            name = $1, description = $2, quantity = $3, is_food_item = $4, expiry_date = $5,
            category = $6, location = $7, min_stock = $8, cost_per_unit = $9, purchase_date = $10,
            calories = $11, supplier = $12, upc = $13, image = $14
          WHERE id = $15 AND user_id = $16
          RETURNING *;
        `;

        const values = [
          name, description, quantity, is_food_item, expiry_date, category, location,
          min_stock, cost_per_unit, purchase_date, calories, supplier, upc, image,
          itemId, userId
        ];

        const result = await client.query(updateQuery, values);
        return NextResponse.json(result.rows[0]);
    } finally {
        client.release();
    }

  } catch (error) {
    console.error(`Error updating item ${itemId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const itemId = params.id;
  const userId = session.user.id;

  const client = await pool.connect();
  try {
    const checkResult = await client.query('SELECT user_id FROM inventory_items WHERE id = $1', [itemId]);
    if (checkResult.rows.length === 0) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    if (checkResult.rows[0].user_id !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await client.query('DELETE FROM inventory_items WHERE id = $1 AND user_id = $2', [itemId, userId]);
    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    console.error(`Error deleting item ${itemId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
      client.release();
  }
}
