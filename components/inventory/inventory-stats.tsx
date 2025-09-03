import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, TrendingUp, Calendar } from "lucide-react"

const stats = [
  {
    title: "Total Items",
    value: "247",
    change: "+12 this week",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    title: "Low Stock Alerts",
    value: "8",
    change: "Needs attention",
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    title: "Total Value",
    value: "$3,247",
    change: "+$156 this month",
    icon: TrendingUp,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    title: "Expiring Soon",
    value: "15",
    change: "Next 30 days",
    icon: Calendar,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
]

export function InventoryStats() {
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
