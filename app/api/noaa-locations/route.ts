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
      'SELECT * FROM noaa_locations WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching NOAA locations:', error);
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

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { name, full_address, street_number, street_name, city, state, zip_code, latitude, longitude } = body;

    if (!name) {
      return NextResponse.json({ error: 'Location name is required.' }, { status: 400 });
    }

    const insertQuery = `
      INSERT INTO noaa_locations (user_id, name, full_address, street_number, street_name, city, state, zip_code, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [userId, name, full_address, street_number, street_name, city, state, zip_code, latitude, longitude];

    const result = await client.query(insertQuery, values);

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating NOAA location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}