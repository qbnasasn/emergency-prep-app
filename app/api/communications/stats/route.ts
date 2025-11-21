import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const client = await pool.connect();
  try {
    // Count family members (contacts)
    const membersRes = await client.query(
      'SELECT COUNT(*) FROM family_members WHERE user_id = $1',
      [userId]
    );
    const membersCount = parseInt(membersRes.rows[0].count);

    // Count plans
    const plansRes = await client.query(
      'SELECT COUNT(*) FROM plans WHERE user_id = $1',
      [userId]
    );
    const plansCount = parseInt(plansRes.rows[0].count);

    // Count kits
    const kitsRes = await client.query(
      'SELECT COUNT(*) FROM kits WHERE user_id = $1',
      [userId]
    );
    const kitsCount = parseInt(kitsRes.rows[0].count);

    return NextResponse.json({
      contacts: membersCount,
      plans: plansCount,
      kits: kitsCount,
    });
  } catch (error) {
    console.error('Error fetching communication stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
