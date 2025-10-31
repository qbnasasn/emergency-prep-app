import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const planId = params.id;

  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const client = await pool.connect();

    // First, verify that the plan belongs to the user
    const planQuery = 'SELECT * FROM plans WHERE id = $1 AND user_id = $2';
    const planResult = await client.query(planQuery, [planId, userId]);
    if (planResult.rows.length === 0) {
      client.release();
      return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
    }

    const routesQuery = `
      SELECT
        r.id,
        r.name,
        r.waypoints
      FROM routes r
      WHERE r.plan_id = $1
    `;
    const routesResult = await client.query(routesQuery, [planId]);

    const routes = [];

    for (const route of routesResult.rows) {
      if (route.waypoints && route.waypoints.length > 0) {
        const waypointsQuery = `
          SELECT id, name, latitude, longitude, address
          FROM plan_locations
          WHERE id = ANY($1::uuid[])
        `;
        const waypointIds = route.waypoints;
        const waypointsResult = await client.query(waypointsQuery, [waypointIds]);

        // Preserve the order of waypoints
        const orderedWaypoints = waypointIds.map(id =>
          waypointsResult.rows.find(wp => wp.id === id)
        ).filter(Boolean); // Filter out any nulls if an ID wasn't found

        route.waypoints = orderedWaypoints;
      }
      routes.push(route);
    }

    client.release();
    return NextResponse.json(routes);
  } catch (error) {
    console.error(`Error fetching routes for plan ${planId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
