import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const client = await pool.connect();
    const query = `
      SELECT
        p.*,
        COALESCE(
          (SELECT json_agg(fm.*)
           FROM family_members fm
           JOIN plan_contacts pc ON fm.id = pc.family_member_id
           WHERE pc.plan_id = p.id),
          '[]'::json
        ) AS contacts,
        COALESCE(
          (SELECT json_agg(pets.*)
           FROM pets
           JOIN plan_pets pp ON pets.id = pp.pet_id
           WHERE pp.plan_id = p.id),
          '[]'::json
        ) AS pets,
        COALESCE(
          (SELECT json_agg(pl.*)
           FROM plan_locations pl
           WHERE pl.plan_id = p.id),
          '[]'::json
        ) AS locations,
        COALESCE(
          (SELECT json_agg(json_build_object('id', i.id, 'name', i.name, 'quantity', pi.quantity))
           FROM inventory_items i
           JOIN plan_items pi ON i.id = pi.item_id
           WHERE pi.plan_id = p.id),
          '[]'::json
        ) AS inventory_items
      FROM
        plans p
      WHERE
        p.user_id = $1
      ORDER BY
        p.is_active DESC, p.created_at DESC;
    `;
    const result = await client.query(query, [userId]);
    client.release();
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching all full plan details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
