import { cookies } from 'next/headers';
import pool from '@/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/session';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  image: string | null;
  householdId: string | null;
  subscriptionPlan: string | null;
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifySessionToken(token);
  return session?.userId ?? null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id,
              email,
              full_name AS "fullName",
              image,
              household_id AS "householdId",
              subscription_plan AS "subscriptionPlan"
       FROM users
       WHERE id = $1`,
      [userId]
    );
    return result.rows[0] ?? null;
  } catch (error) {
    console.error('Error in getAuthUser:', error);
    throw error;
  } finally {
    client.release();
  }
}
