import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, Calendar, Users, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Days of Food",
    value: "14.5",
    change: "For 4 people",
    icon: Calendar,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Total Calories",
    value: "87,240",
    change: "Available in stock",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Family Members",
    value: "4",
    change: "Planned for",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Food Items",
    value: "127",
    change: "In food inventory",
    icon: UtensilsCrossed,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
]

export function FoodPlanningOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
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
