import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const client = await pool.connect();
    const query = `
      SELECT
        p.id,
        p.user_id,
        p.name,
        p.description,
        p.is_active,
        p.created_at,
        p.updated_at,
        p.hazard_type,
        COUNT(DISTINCT pc.family_member_id) AS contacts_count,
        COUNT(DISTINCT pp.pet_id) AS pets_count,
        COUNT(DISTINCT pl.id) AS locations_count,
        COUNT(DISTINCT pi.item_id) AS items_count
      FROM
        plans p
      LEFT JOIN
        plan_contacts pc ON p.id = pc.plan_id
      LEFT JOIN
        plan_pets pp ON p.id = pp.plan_id
      LEFT JOIN
        plan_locations pl ON p.id = pl.plan_id
      LEFT JOIN
        plan_items pi ON p.id = pi.plan_id
      WHERE
        p.user_id = $1
      GROUP BY
        p.id
      ORDER BY
        p.is_active DESC, p.created_at DESC;
    `;
    const result = await client.query(query, [userId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching full plan details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
