import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string;         // This is the planId
    locationId: string; // This is the locationId
  };
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: planId, locationId } = params;

  try {
    const body = await req.json();
    const { name, type, street_number, street_name, city, state, zip_code, notes } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required fields.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const planCheck = await client.query('SELECT user_id FROM plans WHERE id = $1', [planId]);
      if (planCheck.rows.length === 0 || planCheck.rows[0].user_id !== userId) {
        return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
      }

      const updateQuery = `
        UPDATE plan_locations
        SET name = $1, type = $2, street_number = $3, street_name = $4, city = $5, state = $6, zip_code = $7, notes = $8
        WHERE id = $9 AND plan_id = $10
        RETURNING *;
      `;
      const values = [name, type, street_number, street_name, city, state, zip_code, notes, locationId, planId];

      const result = await client.query(updateQuery, values);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating plan location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: planId, locationId } = params;

  try {
    const client = await pool.connect();
    try {
      const planCheck = await client.query('SELECT user_id FROM plans WHERE id = $1', [planId]);
      if (planCheck.rows.length === 0 || planCheck.rows[0].user_id !== userId) {
        return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
      }

      const result = await client.query('DELETE FROM plan_locations WHERE id = $1 AND plan_id = $2', [locationId, planId]);

      if (result.rowCount === 0) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }

      return NextResponse.json({ message: 'Location deleted successfully' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting plan location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
