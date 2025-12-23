
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('id');

    if (!planId) return NextResponse.json({ error: 'Missing id' });

    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM plan_locations WHERE plan_id = $1', [planId]);
        return NextResponse.json(res.rows);
    } finally {
        client.release();
    }
}
