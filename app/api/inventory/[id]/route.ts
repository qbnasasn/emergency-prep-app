import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  const householdId = user.householdId;
  const itemId = (await params).id;

  try {
    const body = await req.json();

    const client = await pool.connect();
    try {
        // Use JOIN to verify household membership (safer fallback if column missing, though confirmed it exists)
        const checkResult = await client.query(
            `SELECT u.household_id
             FROM inventory_items i
             JOIN users u ON i.user_id = u.id
             WHERE i.id = $1`,
            [itemId]
        );

        if (checkResult.rows.length === 0) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }
        if (checkResult.rows[0].household_id !== householdId) {
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
                const val = body[field];
                values.push(val === "" ? null : val);
            }
        });

        if (setClauses.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        // We still need to identify the item. We can use ID.
        // And we should ensure we only update if authorized (which we checked above).
        values.push(itemId);

        const updateQuery = `
          UPDATE inventory_items
          SET ${setClauses.join(', ')}
          WHERE id = $${valueCount++}
          RETURNING *;
        `;

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
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  const householdId = user.householdId;
  const itemId = (await params).id;

  const client = await pool.connect();
  try {
    // Use JOIN to verify
    const checkResult = await client.query(
        `SELECT u.household_id
         FROM inventory_items i
         JOIN users u ON i.user_id = u.id
         WHERE i.id = $1`,
        [itemId]
    );

    if (checkResult.rows.length === 0) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    if (checkResult.rows[0].household_id !== householdId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await client.query('DELETE FROM inventory_items WHERE id = $1', [itemId]);
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting item ${itemId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
      client.release();
  }
}
