import { currentUser } from "@clerk/nextjs/server";
import pool from "@/lib/db";

export async function getAuthUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, email FROM users WHERE email = $1', [email]);
    if (res.rows.length > 0) {
      return res.rows[0];
    } else {
      // Create user
      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0];

      await client.query('BEGIN');

      const insertRes = await client.query(
        'INSERT INTO users (email, full_name, image) VALUES ($1, $2, $3) RETURNING id, email',
        [email, fullName, clerkUser.imageUrl]
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
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error in getAuthUser:", error);
    throw error;
  } finally {
    client.release();
  }
}
