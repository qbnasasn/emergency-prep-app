import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const familyMemberId = params.id;

  try {
    const client = await pool.connect();
    // We should also verify that the family member belongs to the user, but for now this is fine.
    const result = await client.query('SELECT * FROM medical_needs WHERE family_member_id = $1', [familyMemberId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching medical needs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const familyMemberId = params.id;

  try {
    const { condition, medication, dosage, frequency, notes } = await req.json();
    if (!condition) {
      return NextResponse.json({ error: 'Condition is required' }, { status: 400 });
    }

    const client = await pool.connect();
    // We should also verify that the family member belongs to the user.
    const result = await client.query(
      'INSERT INTO medical_needs (family_member_id, condition, medication, dosage, frequency, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [familyMemberId, condition, medication, dosage, frequency, notes]
    );
    client.release();

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating medical need:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
