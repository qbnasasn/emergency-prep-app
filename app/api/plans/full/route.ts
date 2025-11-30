import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get('id');

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  if (planId) {
    // Fetch a single plan with all details
    try {
      const client = await pool.connect();
      const planQuery = 'SELECT * FROM plans WHERE id = $1 AND user_id = $2';
      const planResult = await client.query(planQuery, [planId, userId]);

      if (planResult.rows.length === 0) {
        client.release();
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }

      const plan = planResult.rows[0];

      const contactsQuery = 'SELECT fm.* FROM family_members fm JOIN plan_contacts pc ON fm.id = pc.family_member_id WHERE pc.plan_id = $1';
      const contactsResult = await client.query(contactsQuery, [planId]);
      plan.contacts = contactsResult.rows;

      const petsQuery = 'SELECT p.* FROM pets p JOIN plan_pets pp ON p.id = pp.pet_id WHERE pp.plan_id = $1';
      const petsResult = await client.query(petsQuery, [planId]);
      plan.pets = petsResult.rows;

      const locationsQuery = 'SELECT * FROM plan_locations WHERE plan_id = $1';
      const locationsResult = await client.query(locationsQuery, [planId]);
      plan.locations = locationsResult.rows;

      const itemsQuery = 'SELECT i.*, pi.quantity FROM inventory_items i JOIN plan_items pi ON i.id = pi.item_id WHERE pi.plan_id = $1';
      const itemsResult = await client.query(itemsQuery, [planId]);
      plan.inventory_items = itemsResult.rows;

      // Fetch routes and hydrate waypoints
      const routesQuery = 'SELECT * FROM routes WHERE plan_id = $1';
      const routesResult = await client.query(routesQuery, [planId]);
      const routes = routesResult.rows;

      // Hydrate waypoints
      const hydratedRoutes = routes.map((route: any) => {
        let waypointIds: string[] = [];

        if (Array.isArray(route.waypoints)) {
          waypointIds = route.waypoints;
        } else if (typeof route.waypoints === 'string') {
          try {
            const parsed = JSON.parse(route.waypoints);
            if (Array.isArray(parsed)) {
              waypointIds = parsed;
            }
          } catch (e) {
            console.error('Error parsing waypoints JSON:', e);
            waypointIds = [];
          }
        }

        const hydratedWaypoints = waypointIds.map((waypointId: string) => {
          const location = plan.locations.find((loc: any) => loc.id === waypointId);
          if (location) {
            const lat = parseFloat(location.latitude);
            const lng = parseFloat(location.longitude);

            // Ensure coordinates are valid numbers
            if (!isNaN(lat) && !isNaN(lng)) {
              return {
                id: location.id,
                name: location.name,
                latitude: lat,
                longitude: lng
              };
            }
          }
          return null;
        }).filter((wp: any) => wp !== null);

        return { ...route, waypoints: hydratedWaypoints };
      });

      plan.routes = hydratedRoutes;

      client.release();
      return NextResponse.json(plan);
    } catch (error) {
      console.error(`Error fetching plan ${planId}:`, error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  } else {
    // Fetch all plans with counts
    try {
      const client = await pool.connect();
      const query = `
        SELECT
          p.id,
          p.user_id,
          p.name,
          p.description,
          p.is_active,
          p.created_at,
          p.updated_at,
          p.hazard_type,
          COUNT(DISTINCT pc.family_member_id) AS contacts_count,
          COUNT(DISTINCT pp.pet_id) AS pets_count,
          COUNT(DISTINCT pl.id) AS locations_count,
          COUNT(DISTINCT pi.item_id) AS items_count
        FROM
          plans p
        LEFT JOIN
          plan_contacts pc ON p.id = pc.plan_id
        LEFT JOIN
          plan_pets pp ON p.id = pp.plan_id
        LEFT JOIN
          plan_locations pl ON p.id = pl.plan_id
        LEFT JOIN
          plan_items pi ON p.id = pi.plan_id
        WHERE
          p.user_id = $1
        GROUP BY
          p.id
        ORDER BY
          p.is_active DESC, p.created_at DESC;
      `;
      const result = await client.query(query, [userId]);
      client.release();
      return NextResponse.json(result.rows);
    } catch (error) {
      console.error('Error fetching all plans:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
}
