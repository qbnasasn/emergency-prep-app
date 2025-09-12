import NextAuth from 'next-auth';
import pool from '@/lib/db';
import PgAdapter from "@auth/pg-adapter"
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcrypt';

export const authOptions = {
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
            // User might exist from Google sign-in but has no password
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
