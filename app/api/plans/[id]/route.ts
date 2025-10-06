import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = params;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM plans WHERE id = $1 AND user_id = $2', [id, userId]);
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = params;

    try {
        const { name, description, hazard_type } = await req.json();
        if (!name || !hazard_type) {
            return NextResponse.json({ error: 'Plan name and hazard type are required' }, { status: 400 });
        }

        const client = await pool.connect();
        // Only update the fields that are sent for a PUT request
        const result = await client.query(
            'UPDATE plans SET name = $1, description = $2, hazard_type = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
            [name, description, hazard_type, id, userId]
        );
        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Plan not found or not authorized to update' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = params;

    try {
        const { is_active } = await req.json();

        if (typeof is_active !== 'boolean') {
            return NextResponse.json({ error: 'Invalid `is_active` value' }, { status: 400 });
        }

        const client = await pool.connect();
        const result = await client.query(
            'UPDATE plans SET is_active = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [is_active, id, userId]
        );
        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Plan not found or not authorized to update' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating plan status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = params;

    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM plans WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Plan not found or not authorized to delete' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Plan deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting plan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
