import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

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

export async function PUT(req: Request, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = user.id;
  const { id: planId } = params;

  let client;
  try {
    const { contactIds } = await req.json();
    if (!Array.isArray(contactIds)) {
        return NextResponse.json({ error: 'Invalid input, contactIds must be an array' }, { status: 400 });
    }

    client = await pool.connect();

    // Verify user owns the plan
    const planCheck = await client.query('SELECT user_id FROM plans WHERE id = $1', [planId]);
    if (planCheck.rows.length === 0 || planCheck.rows[0].user_id !== userId) {
      return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
    }

    // Start transaction
    await client.query('BEGIN');

    // Delete existing contacts for this plan
    await client.query('DELETE FROM plan_contacts WHERE plan_id = $1', [planId]);

    // Insert new contacts if any
    if (contactIds.length > 0) {
      const insertPromises = contactIds.map(contactId => {
        return client.query(
          'INSERT INTO plan_contacts (plan_id, family_member_id) VALUES ($1, $2)',
          [planId, contactId]
        );
      });
      await Promise.all(insertPromises);
    }

    // Commit transaction
    await client.query('COMMIT');

    return NextResponse.json({ message: 'Contacts updated successfully' });

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error updating plan contacts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
