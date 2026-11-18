import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import pool from '@/lib/db';
import {
  createSessionToken,
  getSessionCookieOptions,
  hashPassword,
} from '@/lib/session';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().trim().min(1).max(120).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Validation failed' },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const fullName = parsed.data.fullName || email.split('@')[0];
  const passwordHash = hashPassword(parsed.data.password);

  const client = await pool.connect();
  try {
    const existing = await client.query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    await client.query('BEGIN');

    const householdRes = await client.query(
      'INSERT INTO households (name) VALUES ($1) RETURNING id',
      [`${fullName}'s Household`]
    );
    const householdId = householdRes.rows[0].id;

    const userRes = await client.query(
      `INSERT INTO users (email, full_name, password_hash, household_id, subscription_plan)
       VALUES ($1, $2, $3, $4, 'scout')
       RETURNING id, email, full_name AS "fullName", image, household_id AS "householdId", subscription_plan AS "subscriptionPlan"`,
      [email, fullName, passwordHash, householdId]
    );
    const user = userRes.rows[0];

    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    await client.query(
      `INSERT INTO family_members (user_id, first_name, last_name, email, role)
       VALUES ($1, $2, $3, $4, 'Lead Coordinator')`,
      [user.id, firstName, lastName, email]
    );

    await client.query('COMMIT');

    const token = await createSessionToken({ userId: user.id, email: user.email });
    const isHttps =
      req.headers.get('x-forwarded-proto') === 'https' ||
      req.nextUrl.protocol === 'https:';
    const cookieOpts = getSessionCookieOptions(isHttps);
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in POST /api/auth/register:', error);
    return NextResponse.json({ error: 'Failed to register account' }, { status: 500 });
  } finally {
    client.release();
  }
}
