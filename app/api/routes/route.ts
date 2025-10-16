import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import pool from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Not authenticated', { status: 401 });
  }
  const userId = session.user.id;
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT r.id, r.plan_id, r.name, r.waypoints
       FROM routes r
       JOIN plans p ON r.plan_id = p.id
       WHERE p.user_id = $1`,
      [userId]
    );

    // The 'waypoints' column is stored as JSONB, which the pg driver
    // often returns as a JavaScript object/array automatically.
    // No explicit JSON.parse should be needed here if the driver works as expected.
    // If it were a plain text JSON string, we would need:
    // const routes = result.rows.map(route => ({
    //   ...route,
    //   waypoints: typeof route.waypoints === 'string' ? JSON.parse(route.waypoints) : route.waypoints,
    // }));

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch routes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    client.release();
  }
}