import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, MapPin, AlertTriangle, CheckCircle } from "lucide-react"
import { getKits } from "@/lib/data/kits"
import { auth } from "@/lib/auth"

export async function KitsOverview() {
  const session = await auth()
  if (!session?.user?.id) {
    return <div>Please log in to see your kit overview.</div>
  }

  const kits = await getKits(session.user.id)

  const totalKits = kits.length
  const trackedLocations = kits.filter(kit => kit.gps_location).length
  // For now, we'll define an incomplete kit as one with 0 items. This can be refined later.
  const incompleteKits = kits.filter(kit => (kit.item_count || 0) === 0).length
  const readyKits = totalKits - incompleteKits

  const stats = [
    {
      title: "Total Kits",
      value: totalKits.toString(),
      description: "Active emergency kits",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Kit Locations",
      value: trackedLocations.toString(),
      description: "GPS tracked locations",
      icon: MapPin,
      color: "text-green-600",
    },
    {
      title: "Incomplete Kits",
      value: incompleteKits.toString(),
      description: "Kits with no items",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Ready Kits",
      value: readyKits.toString(),
      description: "Kits with items",
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
