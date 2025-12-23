import { NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/auth";
import pool from '@/lib/db';

export async function GET() {
    return NextResponse.json({ message: "Sync Endpoint Ready (POST required)" });
}

export async function POST(req: Request) {
    console.log("[Server] POST /api/sync/kits hit");
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    try {
        const body = await req.json();
        const { id, name, description, gps_location, updated_at } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }

        const client = await pool.connect();
        try {
            // Upsert Logic: Insert or Update on Conflict
            // Note: We assume 'id' is the primary key and is a UUID provided by the client (or matches server ID).
            // Upsert Logic: Handle POINT conversion
            // gps_location body is expected to be { x: number, y: number } or null
            const { x, y } = gps_location || {};

            let query = `
                INSERT INTO kits (id, user_id, name, description, gps_location, updated_at)
                VALUES ($1, $2, $3, $4, NULL, $5)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    gps_location = NULL,
                    updated_at = EXCLUDED.updated_at
                RETURNING *;
            `;

            const params = [id, userId, name, description, updated_at || new Date().toISOString()];

            if (x !== undefined && y !== undefined) {
                query = `
                    INSERT INTO kits (id, user_id, name, description, gps_location, updated_at)
                    VALUES ($1, $2, $3, $4, POINT($5, $6), $7)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        gps_location = EXCLUDED.gps_location,
                        updated_at = EXCLUDED.updated_at
                    RETURNING *;
                `;
                params.push(x, y, updated_at || new Date().toISOString()); // Re-order params for the new query
                // Actually, let's just make it clean params list.
            }
            // Logic above is messy with params. Let's rewrite cleaner.

            const result = await client.query(query, [id, userId, name, description, gps_location, updated_at || new Date().toISOString()]);
            return NextResponse.json(result.rows[0], { status: 200 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error syncing kit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
