import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useMemo } from "react"

// Extended plan interface to include counts from the full API endpoint
interface EmergencyPlanWithCounts {
  id: string
  name: string
  description: string | null
  hazard_type: string
  is_active: boolean
  created_at: string
  updated_at?: string
  contacts_count: number
  pets_count: number
  locations_count: number
  items_count: number
}

interface PlansOverviewProps {
  plans: EmergencyPlanWithCounts[]
}

const calculateDaysAgo = (dateString: string | undefined): string => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days`
}

export function PlansOverview({ plans }: PlansOverviewProps) {
  const stats = useMemo(() => {
    if (!plans) {
      return []
    }

    const totalPlans = plans.length
    const activePlans = plans.filter((plan) => plan.is_active).length

    // A 'completed' plan has basic info + contacts/pets + locations + inventory
    const completedPlans = plans.filter(
      (plan) =>
        plan.name &&
        plan.hazard_type &&
        (plan.contacts_count > 0 || plan.pets_count > 0) &&
        plan.locations_count > 0 &&
        plan.items_count > 0
    ).length

    const mostRecentUpdate = plans.reduce((latest, plan) => {
      const planDate = new Date(plan.updated_at || plan.created_at)
      return planDate > latest ? planDate : latest
    }, new Date(0))

    const lastUpdated =
      plans.length > 0 ? calculateDaysAgo(mostRecentUpdate.toISOString()) : "N/A"

    return [
      {
        title: "Total Plans",
        value: totalPlans.toString(),
        change: "All hazard types covered",
        icon: FileText,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Active Plans",
        value: activePlans.toString(),
        change: "Ready to activate",
        icon: AlertTriangle,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Completed Plans",
        value: completedPlans.toString(),
        change: "Fully configured",
        icon: CheckCircle,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
      {
        title: "Last Updated",
        value: lastUpdated,
        change: "Keep plans current",
        icon: Clock,
        color: "text-primary",
        bgColor: "bg-primary/10",
      },
    ]
  }, [plans])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-body text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground font-body mt-1">
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
