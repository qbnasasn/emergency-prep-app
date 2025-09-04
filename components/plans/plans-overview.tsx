import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react"

const stats = [
  {
    title: "Total Plans",
    value: "12",
    change: "All hazard types covered",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Active Plans",
    value: "0",
    change: "Ready to activate",
    icon: AlertTriangle,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Completed Plans",
    value: "8",
    change: "Fully configured",
    icon: CheckCircle,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Last Updated",
    value: "2 days",
    change: "Keep plans current",
    icon: Clock,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
]

export function PlansOverview() {
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
