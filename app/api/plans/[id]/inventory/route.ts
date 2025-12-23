import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

async function checkPlanOwnership(client: any, planId: string, userId: string, householdId?: string | null) {
    const result = await client.query(`
        SELECT p.user_id, u.household_id 
        FROM plans p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = $1
    `, [planId]);

    if (result.rows.length === 0) {
        return { owned: false, error: new NextResponse(JSON.stringify({ error: 'Plan not found' }), { status: 404 }) };
    }

    const plan = result.rows[0];
    const isOwner = plan.user_id === userId;
    // Strict household check: both must have same non-null household_id
    const isHouseholdMember = householdId && plan.household_id && plan.household_id === householdId;

    if (!isOwner && !isHouseholdMember) {
        return { owned: false, error: new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 }) };
    }
    return { owned: true, error: null };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const planId = params.id;
    const userId = user.id;
    const householdId = user.householdId;
    const client = await pool.connect();

    try {
        const { owned, error } = await checkPlanOwnership(client, planId, userId, householdId);
        if (!owned) return error;

        const itemsResult = await client.query(`
            SELECT i.id, i.name, i.category, pi.quantity
            FROM inventory_items i
            JOIN plan_items pi ON i.id = pi.item_id
            WHERE pi.plan_id = $1
        `, [planId]);

        const kitsResult = await client.query(`
            SELECT k.id, k.name
            FROM kits k
            JOIN plan_kits pk ON k.id = pk.kit_id
            WHERE pk.plan_id = $1
        `, [planId]);

        return NextResponse.json({
            items: itemsResult.rows,
            kits: kitsResult.rows,
        });

    } catch (error) {
        console.error(`Error fetching inventory for plan ${planId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const planId = params.id;
    const userId = user.id;
    const householdId = user.householdId;

    try {
        const { selectedItemIds, selectedKitIds } = await req.json();
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { owned, error } = await checkPlanOwnership(client, planId, userId, householdId);
            if (!owned) {
                await client.query('ROLLBACK');
                return error;
            }

            // Clear existing items and kits for this plan
            await client.query('DELETE FROM plan_items WHERE plan_id = $1', [planId]);
            await client.query('DELETE FROM plan_kits WHERE plan_id = $1', [planId]);

            // Insert new items
            if (selectedItemIds && selectedItemIds.length > 0) {
                for (const itemId of selectedItemIds) {
                    await client.query('INSERT INTO plan_items (plan_id, item_id, quantity) VALUES ($1, $2, $3)', [planId, itemId, 1]); // Assuming quantity 1 for now
                }
            }

            // Insert new kits
            if (selectedKitIds && selectedKitIds.length > 0) {
                for (const kitId of selectedKitIds) {
                    await client.query('INSERT INTO plan_kits (plan_id, kit_id) VALUES ($1, $2)', [planId, kitId]);
                }
            }

            await client.query('COMMIT');
            return NextResponse.json({ message: 'Plan inventory updated successfully' });

        } catch (dbError) {
            await client.query('ROLLBACK');
            throw dbError;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error(`Error updating inventory for plan ${planId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
