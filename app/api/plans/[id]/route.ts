import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth"

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { householdId } = user;
  const { id } = await params;

  try {
    const client = await pool.connect();
    // Allow access if the plan belongs to a user in the same household
    const result = await client.query(
        `SELECT p.*
         FROM plans p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = $1 AND u.household_id = $2`,
        [id, householdId]
    );
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

export async function PUT(req: Request, { params }: RouteParams) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { householdId } = user;
    const { id } = await params;

    try {
        const { name, description, hazard_type } = await req.json();
        if (!name || !hazard_type) {
            return NextResponse.json({ error: 'Plan name and hazard type are required' }, { status: 400 });
        }

        const client = await pool.connect();

        // 1. Verify Authorization: Plan must belong to the same household
        const authCheck = await client.query(
            `SELECT p.id
             FROM plans p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = $1 AND u.household_id = $2`,
            [id, householdId]
        );

        if (authCheck.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Plan not found or not authorized to update' }, { status: 404 });
        }

        // 2. Perform Update
        const result = await client.query(
            'UPDATE plans SET name = $1, description = $2, hazard_type = $3 WHERE id = $4 RETURNING *',
            [name, description, hazard_type, id]
        );
        client.release();

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: RouteParams) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { householdId } = user;
    const { id } = await params;

    try {
        const { is_active } = await req.json();

        if (typeof is_active !== 'boolean') {
            return NextResponse.json({ error: 'Invalid `is_active` value' }, { status: 400 });
        }

        const client = await pool.connect();

        // 1. Verify Authorization: Plan must belong to the same household
        const authCheck = await client.query(
            `SELECT p.id
             FROM plans p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = $1 AND u.household_id = $2`,
            [id, householdId]
        );

        if (authCheck.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Plan not found or not authorized to update' }, { status: 404 });
        }

        // 2. Perform Update
        const result = await client.query(
            'UPDATE plans SET is_active = $1 WHERE id = $2 RETURNING *',
            [is_active, id]
        );
        client.release();

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating plan status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: RouteParams) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { householdId } = user;
    const { id } = await params;

    try {
        const client = await pool.connect();

        // 1. Verify Authorization: Plan must belong to the same household
        const authCheck = await client.query(
            `SELECT p.id
             FROM plans p
             JOIN users u ON p.user_id = u.id
             WHERE p.id = $1 AND u.household_id = $2`,
            [id, householdId]
        );

        if (authCheck.rows.length === 0) {
            client.release();
            return NextResponse.json({ error: 'Plan not found or not authorized to delete' }, { status: 404 });
        }

        // 2. Perform Delete
        const result = await client.query('DELETE FROM plans WHERE id = $1 RETURNING *', [id]);
        client.release();

        return NextResponse.json({ message: 'Plan deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
