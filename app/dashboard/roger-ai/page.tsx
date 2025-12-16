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

  if (hasAccess) {
    return <ClientPage />;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl h-[calc(100vh-2rem)] flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-orange-100 p-3 rounded-full w-fit mb-4">
                <Bot className="w-10 h-10 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Roger AI
            </CardTitle>
            <CardDescription className="text-base mt-2">
                Your Personal Preparedness Assistant
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 text-center">
            <div className="bg-muted/50 p-4 rounded-lg border flex flex-col items-center gap-2">
                <Lock className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    This feature is available exclusively for <span className="font-semibold text-foreground">Prepper Pro</span> and <span className="font-semibold text-foreground">Family Plan</span> members.
                </p>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
                Unlock Roger to get AI-powered advice on your inventory, emergency plans, and survival strategies, working both online and offline.
            </p>

            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold" asChild>
                <Link href="/dashboard/settings/billing">
                    Upgrade to Unlock
                </Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
