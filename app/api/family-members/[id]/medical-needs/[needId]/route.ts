import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function PUT(req: Request, { params }: { params: { id: string, needId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // We should verify that the family member belongs to the user.
    const { needId } = params;
    try {
        const { condition, medication, dosage, frequency, notes } = await req.json();
        if (!condition) {
            return NextResponse.json({ error: 'Condition is required' }, { status: 400 });
        }

        const client = await pool.connect();
        const result = await client.query(
            'UPDATE medical_needs SET condition = $1, medication = $2, dosage = $3, frequency = $4, notes = $5 WHERE id = $6 RETURNING *',
            [condition, medication, dosage, frequency, notes, needId]
        );
        client.release();

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Medical need not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating medical need:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { needId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // We should verify that the family member belongs to the user.
    const { needId } = params;
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM medical_needs WHERE id = $1', [needId]);
        client.release();

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Medical need not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Medical need deleted successfully' });
    } catch (error) {
        console.error('Error deleting medical need:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
