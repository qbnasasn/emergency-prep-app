import { NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/auth";
import pool from '@/lib/db';

export async function POST(req: Request) {
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
            // Handle GPS Point conversion
            const { x, y } = gps_location || {};
            const hasGps = x !== undefined && y !== undefined;

            let query;
            let params;

            if (hasGps) {
                query = `
                        INSERT INTO kits (id, user_id, name, description, gps_location)
                        VALUES ($1, $2, $3, $4, POINT($5, $6))
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            gps_location = POINT($5, $6)
                        RETURNING *;
                    `;
                params = [id, userId, name, description, x, y];
            } else {
                query = `
                        INSERT INTO kits (id, user_id, name, description, gps_location)
                        VALUES ($1, $2, $3, $4, NULL)
                        ON CONFLICT (id) DO UPDATE SET
                            name = EXCLUDED.name,
                            description = EXCLUDED.description,
                            gps_location = NULL
                        RETURNING *;
                    `;
                params = [id, userId, name, description];
            }

            const result = await client.query(query, params);
            return NextResponse.json(result.rows[0], { status: 200 });
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Error syncing kit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
