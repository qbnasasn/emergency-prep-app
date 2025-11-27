import { AuthOptions } from 'next-auth';
import pool from '@/lib/db';
import PgAdapter from "@auth/pg-adapter"
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';
import { checkUserInventory } from '@/lib/inventory-check';
import { checkPlanReminders } from '@/lib/plan-check';

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
          const result = await client.query('SELECT id, full_name, email, password_hash FROM users WHERE email = $1', [credentials.email]);
          const user = result.rows[0];

          if (!user || !user.password_hash) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(credentials.password, user.password_hash);

          if (passwordsMatch) {
            return { id: user.id, name: user.full_name, email: user.email };
          } else {
            return null;
          }
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
          const existingMemberResult = await client.query(
            'SELECT * FROM family_members WHERE user_id = $1',
            [userId]
          );

          if (existingMemberResult.rows.length === 0) {
            const fullName = name || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            await client.query(
              `INSERT INTO family_members (user_id, first_name, last_name, email, role)
               VALUES ($1, $2, $3, $4, 'Lead Coordinator')`,
              [userId, firstName, lastName, email]
            );
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
        } finally {
          client.release();
        }
      }

      // Trigger Alert Checks
      if (user.id) {
        checkUserInventory(user.id).catch(err =>
          console.error(`Inventory check failed during sign-in for user ${user.id}:`, err)
        );
        checkPlanReminders(user.id).catch(err =>
          console.error(`Plan check failed during sign-in for user ${user.id}:`, err)
        );
      }

      return true;
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
