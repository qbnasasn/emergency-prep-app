import { NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/auth";
import pool from '@/lib/db';

export async function POST(req: Request) {
    console.log("[Server] POST /api/sync/kit-items hit");
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    try {
        const body = await req.json();
        const { kit_id, items } = body;
        // Expecting: { kit_id: "...", items: [{ item_id: "...", quantity: 1 }, ...] }

        if (!kit_id) {
            return NextResponse.json({ error: 'Kit ID is required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Verify Kit Ownership
            const kitCheck = await client.query('SELECT user_id FROM kits WHERE id = $1', [kit_id]);
            if (kitCheck.rows.length === 0 || kitCheck.rows[0].user_id !== userId) {
                await client.query('ROLLBACK');
                return NextResponse.json({ error: 'Kit not found or unauthorized' }, { status: 403 });
            }

            // 2. Delete existing items for this kit
            await client.query('DELETE FROM kit_items WHERE kit_id = $1', [kit_id]);

            // 3. Insert new items
            if (items && Array.isArray(items) && items.length > 0) {
                for (const item of items) {
                    await client.query(
                        'INSERT INTO kit_items (kit_id, item_id, quantity) VALUES ($1, $2, $3)',
                        [kit_id, item.item_id, item.quantity || 1]
                    );
                }
            }

            await client.query('COMMIT');
            return NextResponse.json({ success: true }, { status: 200 });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error syncing kit items:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
