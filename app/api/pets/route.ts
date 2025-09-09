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
    const result = await client.query('SELECT * FROM pets WHERE user_id = $1', [userId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching pets:', error);
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
    const { name, species, breed, age, weight_lbs, microchip_id, care_instructions } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Pet name is required' }, { status: 400 });
    }

    const client = await pool.connect();
    const result = await client.query(
      'INSERT INTO pets (user_id, name, species, breed, age, weight_lbs, microchip_id, care_instructions) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, name, species, breed, age, weight_lbs, microchip_id, care_instructions]
    );
    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating pet:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
