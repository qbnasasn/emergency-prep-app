import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';
import { authOptions } from '@/lib/auth-options';

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const userIdRes = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userIdRes.rows.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const userId = userIdRes.rows[0].id;

    const res = await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);

    if (res.rows.length === 0) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
