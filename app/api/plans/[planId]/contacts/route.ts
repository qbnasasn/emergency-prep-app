import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: Request, { params }: { params: { planId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { planId } = params;

    try {
        const client = await pool.connect();
        const result = await client.query(
            `SELECT family_member_id FROM plan_contacts WHERE plan_id = $1`,
            [planId]
        );
        client.release();
        return NextResponse.json(result.rows.map(row => row.family_member_id));
    } catch (error) {
        console.error('Error fetching plan contacts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { planId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { planId } = params;

    try {
        const { contactIds } = await req.json();
        if (!Array.isArray(contactIds)) {
            return NextResponse.json({ error: 'contactIds must be an array' }, { status: 400 });
        }

        const client = await pool.connect();

        await client.query('BEGIN');
        // Clear existing contacts for the plan
        await client.query('DELETE FROM plan_contacts WHERE plan_id = $1', [planId]);

        // Insert new contacts
        for (const contactId of contactIds) {
            await client.query(
                'INSERT INTO plan_contacts (plan_id, family_member_id) VALUES ($1, $2)',
                [planId, contactId]
            );
        }

        await client.query('COMMIT');

        client.release();
        return NextResponse.json({ message: 'Contacts updated successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error updating plan contacts:', error);
        await pool.query('ROLLBACK');
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
