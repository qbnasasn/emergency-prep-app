import { NextResponse } from 'next/server';
// Using the centralized pool from lib/db
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM plans WHERE user_id = $1 ORDER BY is_active DESC, created_at DESC', [userId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    try {
        const { name, description, hazard_type, is_active } = await req.json();
        if (!name || !hazard_type) {
            return NextResponse.json({ error: 'Plan name and hazard type are required' }, { status: 400 });
        }

        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO plans (user_id, name, description, hazard_type, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, name, description, hazard_type, is_active]
        );
        client.release();

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('Error creating plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
