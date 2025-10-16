import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Not authenticated', { status: 401 });

  const planId = params.id;
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM routes WHERE plan_id = $1', [planId]);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch routes for plan:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Not authenticated', { status: 401 });

  const planId = params.id;
  const { routes } = await req.json();

  if (!Array.isArray(routes)) {
    return new NextResponse('Invalid payload: routes must be an array', { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // First, delete all existing routes for this plan to handle deletions.
    await client.query('DELETE FROM routes WHERE plan_id = $1', [planId]);

    // Then, insert all the new and updated routes.
    for (const route of routes) {
      // The frontend sends client-side UUIDs for new routes. We use the same ID.
      // If a route already exists, this will effectively update it.
      await client.query(
        `INSERT INTO routes (id, plan_id, name, waypoints)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           waypoints = EXCLUDED.waypoints`,
        [route.id, planId, route.name, JSON.stringify(route.waypoints)]
      );
    }

    await client.query('COMMIT');
    return NextResponse.json({ message: 'Routes updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to update routes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    client.release();
  }
}