import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, CheckCircle, Clock } from "lucide-react"

const summaryData = [
  {
    title: "Inventory Items",
    value: "247",
    change: "+12 this week",
    icon: Package,
    color: "text-blue-500",
  },
  {
    title: "Active Alerts",
    value: "3",
    change: "2 weather, 1 supply",
    icon: AlertTriangle,
    color: "text-orange-500",
  },
  {
    title: "Emergency Kits",
    value: "8",
    change: "All locations ready",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    title: "Expiring Soon",
    value: "15",
    change: "Next 30 days",
    icon: Clock,
    color: "text-red-500",
  },
]

export function SummaryCards() {
  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-lg text-gray-900">Quick Overview</h2>
      {summaryData.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-body text-sm font-medium text-gray-600">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-gray-900">{item.value}</div>
            <p className="text-xs text-gray-500 font-body">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
