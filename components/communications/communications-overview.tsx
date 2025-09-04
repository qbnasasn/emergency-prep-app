import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radio, Wifi, Satellite, Users } from "lucide-react"

const stats = [
  {
    title: "Meshtastic Nodes",
    value: "12",
    change: "3 active nearby",
    icon: Wifi,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "GMRS Channels",
    value: "22",
    change: "All monitored",
    icon: Radio,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "NOAA Weather",
    value: "7",
    change: "Frequencies active",
    icon: Satellite,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Emergency Contacts",
    value: "8",
    change: "Ready to reach",
    icon: Users,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
]

export function CommunicationsOverview() {
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
