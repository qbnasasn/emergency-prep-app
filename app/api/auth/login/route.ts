import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import pool from '@/lib/db';
import {
  createSessionToken,
  getSessionCookieOptions,
  verifyPassword,
} from '@/lib/session';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Validation failed' },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id,
              email,
              full_name AS "fullName",
              image,
              password_hash AS "passwordHash",
              household_id AS "householdId",
              subscription_plan AS "subscriptionPlan"
       FROM users
       WHERE LOWER(email) = $1`,
      [email]
    );

    const row = result.rows[0];
    if (!row || !row.passwordHash || !verifyPassword(parsed.data.password, row.passwordHash)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const { passwordHash: _ignored, ...user } = row;
    const token = await createSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({ user });
    response.cookies.set(getSessionCookieOptions().name, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json({ error: 'Failed to sign in' }, { status: 500 });
  } finally {
    client.release();
  }
}
