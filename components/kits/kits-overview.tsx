import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, MapPin, AlertTriangle, CheckCircle } from "lucide-react"

export function KitsOverview() {
  const stats = [
    {
      title: "Total Kits",
      value: "12",
      description: "Active emergency kits",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Kit Locations",
      value: "8",
      description: "GPS tracked locations",
      icon: MapPin,
      color: "text-green-600",
    },
    {
      title: "Incomplete Kits",
      value: "3",
      description: "Missing required items",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Ready Kits",
      value: "9",
      description: "Fully stocked and ready",
      icon: CheckCircle,
      color: "text-emerald-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
