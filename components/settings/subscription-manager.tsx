"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Shield, Users } from "lucide-react"

interface SubscriptionManagerProps {
  subscriptionPlan?: string;
}

export function SubscriptionManager({ subscriptionPlan = "scout" }: SubscriptionManagerProps) {

  const plans = [
    {
      name: "Scout (Free)",
      id: "scout",
      features: ["50 Inventory Items", "1 Custom Kit", "Basic Checklists", "Local Roger AI"],
      price: "$0/mo",
      icon: Shield
    },
    {
      name: "Prepper Pro",
      id: "prepper_pro",
      features: ["Unlimited Inventory", "Unlimited Kits", "Cloud Roger AI", "Weather Alerts", "PDF Exports"],
      price: "$9.99/mo",
      icon: Zap
    },
    {
      name: "Family Plan",
      id: "family_plan",
      features: ["Everything in Pro", "Share with 5 Members", "Sync Across Devices", "Role Management"],
      price: "$19.99/mo",
      icon: Users
    }
  ]

  const currentPlan = plans.find(p => p.id === subscriptionPlan) || plans[0]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>Manage your billing and upgrade your preparedness</CardDescription>
            </div>
            <div className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-full text-sm font-medium border border-orange-200 dark:border-orange-800">
                Current: {currentPlan.name}
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
            {plans.map(plan => {
                const Icon = plan.icon
                const isCurrent = plan.id === subscriptionPlan
                const isFree = plan.id === "scout"

                return (
                <div key={plan.id} className={`flex flex-col p-4 rounded-xl border ${isCurrent ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/10 ring-1 ring-orange-500/20' : 'border-border bg-card'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${isCurrent ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' : 'bg-muted text-muted-foreground'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-sm">{plan.name}</h3>
                    </div>

                    <div className="mb-4">
                        <span className="text-2xl font-black">{plan.price}</span>
                    </div>

                    <ul className="space-y-2 text-xs text-muted-foreground flex-1 mb-4">
                        {plan.features.map(f => (
                            <li key={f} className="flex items-center gap-2">
                                <Check className={`w-3 h-3 ${isCurrent ? 'text-orange-500' : 'text-green-500'}`} /> {f}
                            </li>
                        ))}
                    </ul>

                    {isCurrent ? (
                         <Button className="w-full" disabled variant="outline">
                            Active Plan
                         </Button>
                    ) : (
                         <Button
                            className="w-full"
                            variant={isFree ? "outline" : "default"}
                            disabled
                         >
                            Self-Hosted
                         </Button>
                    )}
                </div>
            )})}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
                Running in self-hosted open-source mode. Plan limits can be configured in your local PostgreSQL database.
            </p>
        </div>
      </CardContent>
    </Card>
  )
}
