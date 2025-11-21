import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = params;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM rss_feeds WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Feed not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting RSS feed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = params;

  try {
      const body = await req.json();
      const { name, url } = body;

      if (!name || !url) {
          return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
            'UPDATE rss_feeds SET name = $1, url = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
            [name, url, id, userId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Feed not found or access denied' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
      } finally {
        client.release();
      }
  } catch (error) {
      console.error('Error updating RSS feed:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
