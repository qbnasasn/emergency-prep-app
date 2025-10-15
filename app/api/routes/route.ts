import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { Kysely } from 'kysely';
import { NeonDialect } from 'kysely-neon';

interface Database {
  routes: {
    id: string;
    plan_id: string;
    name: string;
    waypoints: any; // Using any for JSONB
  };
  plans: {
    id: string;
    user_id: string;
  };
}

const db = new Kysely<Database>({
  dialect: new NeonDialect({
    connectionString: process.env.POSTGRES_URL,
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Not authenticated', { status: 401 });
  }
  const userId = session.user.id;

  try {
    const routes = await db.selectFrom('routes')
      .selectAll()
      .where('plan_id', 'in', (eb) => eb.selectFrom('plans').select('id').where('user_id', '=', userId))
      .execute();

    return NextResponse.json(routes);
  } catch (error) {
    console.error('Failed to fetch routes:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}