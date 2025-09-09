import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM plans WHERE user_id = $1', [userId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { name, description, hazard_type } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO plans (user_id, name, description, hazard_type, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, name, description, hazard_type, true]
    );
    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
