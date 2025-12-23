import { getAuthUser } from '@/lib/auth';
import ClientPage from './client-page';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function RogerPage() {
  const user = await getAuthUser();

  if (!user) {
    // Should be handled by middleware/auth check generally, but safe fallback
    return <div>Please sign in to access Roger AI.</div>;
  }

  const allowedPlans = ['prepper_pro', 'family_plan'];
  const hasAccess = allowedPlans.includes(user.subscriptionPlan);

  // Always allow access, but pass the plan status to the client
  return <ClientPage isPaidPlan={hasAccess} />;
}
