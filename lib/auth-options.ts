import { AuthOptions } from 'next-auth';
import pool from '@/lib/db';
import PgAdapter from "@auth/pg-adapter"
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';

export const authOptions: AuthOptions = {
  adapter: PgAdapter(pool),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const client = await pool.connect();
        try {
            // Check if a user with the given email exists and is linked to the 'credentials' provider
            const userQuery = `
                SELECT u.id, u.name, u.email, u.password
                FROM users u
                JOIN accounts a ON u.id = a.user_id
                WHERE u.email = $1 AND a.provider = 'credentials'
            `;
            const result = await client.query(userQuery, [credentials.email]);
            const user = result.rows[0];

            if (!user || !user.password) {
                // No user found with this email for the credentials provider
                return null;
            }

            // Verify the password
            const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

            if (passwordsMatch) {
                // Return the user object if the password is correct
                return { id: user.id, name: user.name, email: user.email };
            } else {
                // Password does not match
                return null;
            }
        } catch (error) {
            console.error('Authorization error:', error);
            return null;
        } finally {
            client.release();
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const { name, email } = user;
        const userId = user.id;

        const client = await pool.connect();
        try {
          // Check if the user already exists in the family_members table
          const existingMemberResult = await client.query(
            'SELECT * FROM family_members WHERE user_id = $1',
            [userId]
          );

          if (existingMemberResult.rows.length === 0) {
            // If the user doesn't exist, insert them
            const fullName = name || '';
            const nameParts = fullName.split(' ').filter(Boolean);
            const firstName = nameParts.shift() || '';
            const lastName = nameParts.join(' ');

            await client.query(
              `INSERT INTO family_members (user_id, first_name, last_name, email, role)
               VALUES ($1, $2, $3, $4, 'Lead Coordinator')`,
              [userId, firstName, lastName, email]
            );
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false; // Prevent sign-in if there's an error
        } finally {
          client.release();
        }
      }
      return true; // Continue with the sign-in process
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};