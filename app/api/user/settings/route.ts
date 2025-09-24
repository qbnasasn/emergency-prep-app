import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT noaa_alert_locations FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // It's not an error if settings don't exist yet, just return empty
      return NextResponse.json({ noaa_alert_locations: [] });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { noaa_alert_locations } = body;

    // Ensure the data is a valid JSON array
    if (!Array.isArray(noaa_alert_locations)) {
      return NextResponse.json({ error: 'Invalid data format for NOAA alert locations.' }, { status: 400 });
    }

    const locationsJson = JSON.stringify(noaa_alert_locations);

    const upsertQuery = `
      INSERT INTO user_settings (user_id, noaa_alert_locations)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET noaa_alert_locations = EXCLUDED.noaa_alert_locations
      RETURNING *;
    `;

    const result = await client.query(upsertQuery, [userId, locationsJson]);

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error saving user settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
