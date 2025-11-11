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
          SELECT id, name, latitude, longitude, street_number, street_name, city, state, zip_code
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const planId = params.id;
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const { routes } = await req.json();
        const client = await pool.connect();

        try {
            // Verify plan ownership
            const planResult = await client.query('SELECT * FROM plans WHERE id = $1 AND user_id = $2', [planId, userId]);
            if (planResult.rows.length === 0) {
                return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
            }

            await client.query('BEGIN');

            // Delete existing routes for this plan
            await client.query('DELETE FROM routes WHERE plan_id = $1', [planId]);

            // Insert new routes
            for (const route of routes) {
                // Ensure waypoints are just an array of location IDs
                const waypointIds = route.waypoints.map(wp => wp.id || wp);
                await client.query(
                    'INSERT INTO routes (id, plan_id, name, waypoints) VALUES ($1, $2, $3, $4)',
                    [route.id, planId, route.name, waypointIds]
                );
            }

            await client.query('COMMIT');
            return NextResponse.json({ message: 'Routes updated successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error(`Error updating routes for plan ${planId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
