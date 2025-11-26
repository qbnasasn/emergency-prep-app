import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { sendNotification } from '@/lib/notifications';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const itemId = params.id;
  const userId = session.user.id;

  try {
    const body = await req.json();

    const client = await pool.connect();
    try {
        const checkResult = await client.query('SELECT user_id FROM inventory_items WHERE id = $1', [itemId]);
        if (checkResult.rows.length === 0) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        if (checkResult.rows[0].user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const fields = [
            'name', 'description', 'quantity', 'expiry_date',
            'category', 'location', 'min_stock', 'cost_per_unit', 'purchase_date',
            'calories', 'supplier', 'upc', 'image', 'nutrition_type'
        ];

        const setClauses: string[] = [];
        const values: any[] = [];
        let valueCount = 1;

        fields.forEach(field => {
            if (body[field] !== undefined) {
                setClauses.push(`${field} = $${valueCount++}`);
                // Handle empty strings for nullable fields to avoid DB errors
                // Especially important for date and numeric fields
                const val = body[field];
                values.push(val === "" ? null : val);
            }
        });

        if (setClauses.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        values.push(itemId, userId);

        // Get the current state of the item BEFORE updating
        const currentStateResult = await client.query('SELECT quantity, min_stock FROM inventory_items WHERE id = $1', [itemId]);
        const currentState = currentStateResult.rows[0];

        const updateQuery = `
          UPDATE inventory_items
          SET ${setClauses.join(', ')}
          WHERE id = $${valueCount++} AND user_id = $${valueCount++}
          RETURNING *;
        `;

        const result = await client.query(updateQuery, values);
        const updatedItem = result.rows[0];

        // Check if a low stock notification should be sent
        const newQuantity = updatedItem.quantity;
        const minStock = updatedItem.min_stock;

        if (minStock !== null && newQuantity < minStock) {
            const oldQuantity = currentState.quantity;
            if (oldQuantity >= minStock) { // Only trigger when crossing the threshold
                 await sendNotification(
                    userId,
                    'Low Stock Alert',
                    `Your supply of ${updatedItem.name} is running low. You have ${newQuantity} remaining.`,
                    'inventory'
                );
            }
        }

        return NextResponse.json(updatedItem);
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
