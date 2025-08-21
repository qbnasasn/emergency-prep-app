import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM kits');
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching kits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
