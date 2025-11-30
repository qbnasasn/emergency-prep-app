import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string; // This is the noaa_location id
  };
}

export async function PUT(req: Request, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  const { id } = params;

  const client = await pool.connect();
  try {
    const body = await req.json();
    const { name, full_address, street_number, street_name, city, state, zip_code, latitude, longitude } = body;

    if (!name) {
      return NextResponse.json({ error: 'Location name is required.' }, { status: 400 });
    }

    const updateQuery = `
      UPDATE noaa_locations
      SET name = $1, full_address = $2, street_number = $3, street_name = $4, city = $5, state = $6, zip_code = $7, latitude = $8, longitude = $9
      WHERE id = $10 AND user_id = $11
      RETURNING *;
    `;
    const values = [name, full_address, street_number, street_name, city, state, zip_code, latitude, longitude, id, userId];

    const result = await client.query(updateQuery, values);
    if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Location not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating NOAA location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  const { id } = params;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'DELETE FROM noaa_locations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Location not found or access denied' }, { status: 404 });
    }

    return new Response(null, { status: 204 }); // Success, no content
  } catch (error) {
    console.error('Error deleting NOAA location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}