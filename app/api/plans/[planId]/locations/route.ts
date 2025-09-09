import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request, { params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const planId = params.planId;

  try {
    const client = await pool.connect();
    // We should also verify that the plan belongs to the user.
    const result = await client.query('SELECT * FROM plan_locations WHERE plan_id = $1', [planId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching plan locations:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const planId = params.planId;

  try {
    const { name, type, street_number, street_name, city, state, zip_code, notes } = await req.json();
    if (!name || !type) {
      return NextResponse.json({ error: 'Location name and type are required' }, { status: 400 });
    }

    const client = await pool.connect();
    // We should also verify that the plan belongs to the user.
    const result = await client.query(
      'INSERT INTO plan_locations (plan_id, name, type, street_number, street_name, city, state, zip_code, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [planId, name, type, street_number, street_name, city, state, zip_code, notes]
    );
    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating plan location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
