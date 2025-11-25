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
        const checkResult = await client.query('SELECT user_id, quantity, min_stock FROM inventory_items WHERE id = $1', [itemId]);
        if (checkResult.rows.length === 0) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const currentItem = checkResult.rows[0];
        if (currentItem.user_id !== userId) {
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

        const updateQuery = `
          UPDATE inventory_items
          SET ${setClauses.join(', ')}
          WHERE id = $${valueCount++} AND user_id = $${valueCount++}
          RETURNING *;
        `;

        const result = await client.query(updateQuery, values);
        const updatedItem = result.rows[0];

        // Refined Alert Logic
        // Trigger if:
        // 1. Quantity or min_stock was updated AND
        // 2. Current quantity is <= min_stock AND
        // 3. (Previous quantity was > min_stock OR Quantity decreased)
        // This avoids spamming alerts if I just rename the item but it stays low stock.

        if (body.quantity !== undefined || body.min_stock !== undefined) {
            const newQty = updatedItem.quantity;
            const newMin = updatedItem.min_stock;
            const oldQty = currentItem.quantity;
            const oldMin = currentItem.min_stock; // Note: oldMin might be null

            // Only alert if we have a min_stock
            if (newMin !== null) {
              const isLow = newQty <= newMin;
              const wasLow = oldMin !== null && oldQty <= oldMin;

              // Trigger if:
              // - It just became low (was not low before)
              // - OR it was already low, but the quantity dropped further (urgency increased)
              // - We ignore updates that just change name/location/etc (handled by outer if)

              if (isLow && (!wasLow || newQty < oldQty)) {
                 console.log(`Triggering low stock alert for ${updatedItem.name}`);
                 await sendNotification(
                    userId,
                    'Low Stock Alert',
                    `Your inventory item "${updatedItem.name}" is low on stock (${newQty} remaining, min: ${newMin}).`,
                    'inventory',
                    '/dashboard/inventory'
                  );
              }
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
