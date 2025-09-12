import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

interface RouteParams {
  params: {
    id: string; // This is the planId
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id: planId } = params;

  try {
    const client = await pool.connect();

    // First, verify the user owns the plan
    const planCheck = await client.query('SELECT user_id FROM plans WHERE id = $1', [planId]);
    if (planCheck.rows.length === 0 || planCheck.rows[0].user_id !== userId) {
      client.release();
      return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
    }

    // If verification passes, fetch the contacts
    const result = await client.query(
      `SELECT fm.* FROM family_members fm
       JOIN plan_contacts pc ON fm.id = pc.family_member_id
       WHERE pc.plan_id = $1`,
      [planId]
    );

    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching plan contacts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
