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