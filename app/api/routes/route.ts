import { NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/auth"
import pool from '@/lib/db'; // Using the project's original db pool

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return new NextResponse('Not authenticated', { status: 401 });
  }
  const userId = user.id;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT
        r.id,
        r.name,
        r.plan_id,
        (
          SELECT json_agg(pl.*)
          FROM plan_locations pl
          WHERE pl.id IN (SELECT value::uuid FROM jsonb_array_elements_text(r.waypoints))
        ) as waypoints
       FROM routes r
       JOIN plans p ON r.plan_id = p.id
       WHERE p.user_id = $1`,
      [userId]
    );
    const routes = result.rows.map(r => ({
      ...r,
      waypoints: r.waypoints || [] // Ensure waypoints is an array
    }));
    return NextResponse.json(routes);
  } catch (error) {
    console.error('Failed to fetch routes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const { id, plan_id, name, description, waypoints, color } = await req.json();

    const client = await pool.connect();
    try {
      // Upsert Logic
      const query = `
                INSERT INTO routes (id, plan_id, name, description, waypoints, color, updated_at)
                VALUES ($1, $2, $3, $4, $5::jsonb, $6, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    waypoints = EXCLUDED.waypoints,
                    color = EXCLUDED.color,
                    updated_at = NOW()
                RETURNING *;
            `;
      const result = await client.query(query, [id, plan_id, name, description, JSON.stringify(waypoints), color]);
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to upsert route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}