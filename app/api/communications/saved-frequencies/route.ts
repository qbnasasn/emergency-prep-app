import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM saved_frequencies WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching saved frequencies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { frequency, description, mode } = await req.json();
    if (!frequency) {
      return NextResponse.json({ error: 'Frequency is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO saved_frequencies (user_id, frequency, description, mode) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.id, frequency, description, mode]
      );
      return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving frequency:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
