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
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch routes via API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  } finally {
    client.release();
  }
}