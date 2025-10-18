import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string; // This is the planId
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: planId } = params;

  try {
    const client = await pool.connect();
    try {
      const planCheck = await client.query('SELECT user_id FROM plans WHERE id = $1', [planId]);
      if (planCheck.rows.length === 0 || planCheck.rows[0].user_id !== userId) {
        return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
      }

      const result = await client.query(
        'SELECT * FROM routes WHERE plan_id = $1 ORDER BY created_at ASC',
        [planId]
      );
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: planId } = params;

  try {
    const { routes } = await req.json();
    if (!Array.isArray(routes)) {
      return NextResponse.json({ error: 'Invalid payload: routes must be an array' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const planCheck = await client.query('SELECT user_id FROM plans WHERE id = $1', [planId]);
      if (planCheck.rows.length === 0 || planCheck.rows[0].user_id !== userId) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
      }

      // Delete existing routes for this plan
      await client.query('DELETE FROM routes WHERE plan_id = $1', [planId]);

      // Insert new routes one by one for robustness
      for (const route of routes) {
        const { name, waypoints } = route;
        if (name && Array.isArray(waypoints)) {
            const insertQuery = `
                INSERT INTO routes (plan_id, name, waypoints)
                VALUES ($1, $2, $3);
            `;
            // The 'waypoints' column is of type jsonb, so we stringify the array
            await client.query(insertQuery, [planId, name, JSON.stringify(waypoints)]);
        }
      }

      await client.query('COMMIT');

      // Fetch the newly created routes to return them
      const newRoutesResult = await client.query('SELECT * FROM routes WHERE plan_id = $1 ORDER BY created_at ASC', [planId]);

      return NextResponse.json(newRoutesResult.rows, { status: 200 });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating routes:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
