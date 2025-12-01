import { currentUser } from "@clerk/nextjs/server";
import pool from "@/lib/db";

export async function getAuthUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const clerkId = clerkUser.id;
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const client = await pool.connect();
  try {
    // 1. Try to find by clerk_id (Primary/Fastest)
    const byClerkId = await client.query('SELECT id, email FROM users WHERE clerk_id = $1', [clerkId]);
    if (byClerkId.rows.length > 0) {
        return byClerkId.rows[0];
    }

    // 2. Fallback: Try to find by email (Legacy/Migration)
    const byEmail = await client.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (byEmail.rows.length > 0) {
        const user = byEmail.rows[0];
        // MIGRATE: Link this legacy user to the Clerk ID
        await client.query('UPDATE users SET clerk_id = $1 WHERE id = $2', [clerkId, user.id]);
        return user;
    }

    // 3. Create new user
    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0];

    await client.query('BEGIN');

    const insertRes = await client.query(
      'INSERT INTO users (email, full_name, image, clerk_id) VALUES ($1, $2, $3, $4) RETURNING id, email',
      [email, fullName, clerkUser.imageUrl, clerkId]
    );
    const newUser = insertRes.rows[0];

    // Create Family Member (Lead Coordinator)
    const firstName = clerkUser.firstName || fullName.split(' ')[0];
    const lastName = clerkUser.lastName || (fullName.split(' ').length > 1 ? fullName.split(' ').slice(1).join(' ') : '');

    await client.query(
      `INSERT INTO family_members (user_id, first_name, last_name, email, role)
       VALUES ($1, $2, $3, $4, 'Lead Coordinator')`,
      [newUser.id, firstName, lastName, email]
    );

    await client.query('COMMIT');
    return newUser;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error in getAuthUser:", error);
    throw error;
  } finally {
    client.release();
  }
}
