import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(req: Request, { params }: { params: { petId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const petId = params.petId;

    try {
        const { name, species, breed, age, weight_lbs, microchip_id, care_instructions } = await req.json();
        if (!name) {
            return NextResponse.json({ error: 'Pet name is required' }, { status: 400 });
        }

        const client = await pool.connect();
        const result = await client.query(
            'UPDATE pets SET name = $1, species = $2, breed = $3, age = $4, weight_lbs = $5, microchip_id = $6, care_instructions = $7 WHERE id = $8 AND user_id = $9 RETURNING *',
            [name, species, breed, age, weight_lbs, microchip_id, care_instructions, petId, userId]
        );
        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating pet:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { petId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const petId = params.petId;

    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM pets WHERE id = $1 AND user_id = $2', [petId, userId]);
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Pet deleted successfully' });
    } catch (error) {
        console.error('Error deleting pet:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
