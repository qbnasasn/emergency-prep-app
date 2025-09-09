import { PlanBuilder } from "@/components/plans/plan-builder"
import pool from '@/lib/db';
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"

async function getPlan(planId: string, userId: string) {
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM plans WHERE id = $1 AND user_id = $2', [planId, userId]);
        return result.rows[0];
    } finally {
        client.release();
    }
}

export default async function PlanBuilderPage({ params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    // This should be handled by middleware, but as a fallback:
    return <p>Unauthorized</p>;
  }

  const plan = await getPlan(params.planId, session.user.id);

  if (!plan) {
    return <p>Plan not found.</p>;
  }

  return <PlanBuilder planId={params.planId} initialPlanData={plan} />
}
