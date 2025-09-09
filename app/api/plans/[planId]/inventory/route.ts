import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request, { params }: { params: { planId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { planId } = params;

    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT item_id, quantity FROM plan_items WHERE plan_id = $1`,
            [planId]
        );
        client.release();
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching plan items:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { planId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { planId } = params;

    try {
        const { itemId, quantity } = await req.json();
        if (!itemId || !quantity) {
            return NextResponse.json({ error: 'Item ID and quantity are required' }, { status: 400 });
        }

        const client = await pool.connect();
        // Check if item already exists in the plan
        const existingItem = await client.query('SELECT * FROM plan_items WHERE plan_id = $1 AND item_id = $2', [planId, itemId]);

        let result;
        if (existingItem.rows.length > 0) {
            // Update quantity
            result = await client.query(
                'UPDATE plan_items SET quantity = $1 WHERE plan_id = $2 AND item_id = $3 RETURNING *',
                [quantity, planId, itemId]
            );
        } else {
            // Insert new item
            result = await client.query(
                'INSERT INTO plan_items (plan_id, item_id, quantity) VALUES ($1, $2, $3) RETURNING *',
                [planId, itemId, quantity]
            );
        }

        client.release();
        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error adding item to plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { planId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { planId } = params;

    try {
        const { itemId } = await req.json();
        if (!itemId) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        const client = await pool.connect();
        await client.query('DELETE FROM plan_items WHERE plan_id = $1 AND item_id = $2', [planId, itemId]);
        client.release();

        return NextResponse.json({ message: 'Item removed from plan successfully' });
    } catch (error) {
        console.error('Error removing item from plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
