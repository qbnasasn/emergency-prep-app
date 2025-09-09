import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(req: Request, { params }: { params: { planId: string, locationId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // We should verify that the plan belongs to the user.
    const { locationId } = params;
    try {
        const { name, type, street_number, street_name, city, state, zip_code, notes } = await req.json();
        if (!name || !type) {
            return NextResponse.json({ error: 'Location name and type are required' }, { status: 400 });
        }

        const client = await pool.connect();
        const result = await client.query(
            'UPDATE plan_locations SET name = $1, type = $2, street_number = $3, street_name = $4, city = $5, state = $6, zip_code = $7, notes = $8 WHERE id = $9 RETURNING *',
            [name, type, street_number, street_name, city, state, zip_code, notes, locationId]
        );
        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating location:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { locationId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // We should verify that the plan belongs to the user.
    const { locationId } = params;
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM plan_locations WHERE id = $1', [locationId]);
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Location deleted successfully' });
    } catch (error) {
        console.error('Error deleting location:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
