import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, AlertTriangle, Calendar, DollarSign } from "lucide-react"

const stats = [
  {
    title: "Items to Buy",
    value: "23",
    change: "8 urgent",
    icon: ShoppingCart,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    title: "Out of Stock",
    value: "5",
    change: "Critical items",
    icon: AlertTriangle,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    title: "Expiring Soon",
    value: "12",
    change: "Next 30 days",
    icon: Calendar,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
  {
    title: "Estimated Cost",
    value: "$147",
    change: "For all items",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
]

export function ShoppingStats() {
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
