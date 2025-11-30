import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

interface RouteParams {
  params: {
    id: string; // This is the planId
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  const { id: planId } = params;

  try {
    const client = await pool.connect();
    try {
      const planCheck = await client.query('SELECT user_id FROM plans WHERE id = $1', [planId]);
      if (planCheck.rows.length === 0 || planCheck.rows[0].user_id !== userId) {
        return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
      }

      const result = await client.query(
        'SELECT * FROM plan_locations WHERE plan_id = $1 ORDER BY created_at ASC',
        [planId]
      );
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching plan locations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  const { id: planId } = params;

  try {
    const body = await req.json();
    const { name, type, street_number, street_name, city, state, zip_code, notes, latitude, longitude } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required fields.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const planCheck = await client.query('SELECT user_id FROM plans WHERE id = $1', [planId]);
      if (planCheck.rows.length === 0 || planCheck.rows[0].user_id !== userId) {
        return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
      }

      const insertQuery = `
        INSERT INTO plan_locations (plan_id, name, type, street_number, street_name, city, state, zip_code, notes, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *;
      `;
      const values = [planId, name, type, street_number, street_name, city, state, zip_code, notes, latitude, longitude];

      const result = await client.query(insertQuery, values);
      return NextResponse.json(result.rows[0], { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating plan location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
