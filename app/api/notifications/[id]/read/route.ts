import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';
import { authOptions } from '@/lib/auth-options';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const userIdRes = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userIdRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userIdRes.rows[0].id;

    // Mark as read, ensuring it belongs to the user
    await pool.query(
      'UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
