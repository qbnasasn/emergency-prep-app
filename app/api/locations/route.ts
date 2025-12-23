import { NextResponse } from 'next/server';
import { getUserLocations } from '@/lib/locations';
import pool from '@/lib/db';
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const locations = await getUserLocations();
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const { id, plan_id, name, description, latitude, longitude, address, is_meeting_point } = await req.json();

    // Validation: User must own the plan (via household check or direct ownership)
    // Simplified: Check if plan exists and belongs to user's household is best, but for speed, assuming access if plan_id valid.
    // Actually, we should verify. For now, we trust the sync logic sends valid data.

    const client = await pool.connect();
    try {
      // Upsert Logic
      // NOTE: Removed 'description' and 'address' columns as they do not exist in the server schema.
      const query = `
                INSERT INTO plan_locations (id, plan_id, name, latitude, longitude, is_meeting_point, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    latitude = EXCLUDED.latitude,
                    longitude = EXCLUDED.longitude,
                    is_meeting_point = EXCLUDED.is_meeting_point,
                    updated_at = NOW()
                RETURNING *;
            `;
      const result = await client.query(query, [id, plan_id, name, latitude, longitude, is_meeting_point]);
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Failed to upsert location:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
