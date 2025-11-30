import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM rss_feeds WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  try {
      const body = await req.json();
      const { name, url } = body;

      if (!name || !url) {
          return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 });
      }

      const client = await pool.connect();
      try {
        const result = await client.query(
            'INSERT INTO rss_feeds (user_id, name, url) VALUES ($1, $2, $3) RETURNING *',
            [userId, name, url]
        );
        return NextResponse.json(result.rows[0]);
      } finally {
        client.release();
      }
  } catch (error) {
      console.error('Error adding RSS feed:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
