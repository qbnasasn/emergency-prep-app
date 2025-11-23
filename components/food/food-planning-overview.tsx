
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, Calendar, Users, TrendingUp } from "lucide-react"

interface FoodPlanningOverviewProps {
  stats: {
    daysOfFood: number;
    totalCalories: number;
    familyMemberCount: number;
    foodItemsCount: number;
  }
}

export function FoodPlanningOverview({ stats }: FoodPlanningOverviewProps) {
  const statItems = [
    {
      title: "Days of Food",
      value: stats.daysOfFood.toFixed(1),
      change: `For ${stats.familyMemberCount} people`,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Calories",
      value: stats.totalCalories.toLocaleString(),
      change: "Available in stock",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Family Members",
      value: stats.familyMemberCount.toString(),
      change: "Planned for",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Food Items",
      value: stats.foodItemsCount.toString(),
      change: "In food inventory",
      icon: UtensilsCrossed,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-body text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">{stat.value}</div>
            <p className="text-xs text-muted-foreground font-body mt-1">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
