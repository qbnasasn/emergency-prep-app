import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request, { params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const planId = params.planId;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM plans WHERE id = $1 AND user_id = $2', [planId, userId]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { planId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const planId = params.planId;

    try {
        const { name, description, hazard_type, is_active } = await req.json();
        if (!name) {
            return NextResponse.json({ error: 'Plan name is required' }, { status: 400 });
        }

        const client = await pool.connect();
        const result = await client.query(
            'UPDATE plans SET name = $1, description = $2, hazard_type = $3, is_active = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
            [name, description, hazard_type, is_active, planId, userId]
        );
        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
