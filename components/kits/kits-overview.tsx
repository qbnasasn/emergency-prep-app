"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, MapPin, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { getKits, Kit } from "@/lib/data/kits"

export function KitsOverview() {
  const { data: session } = useSession()
  const [kits, setKits] = useState<Kit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchKits = async () => {
      if (session?.user?.id) {
        setIsLoading(true)
        const userKits = await getKits(session.user.id)
        setKits(userKits)
        setIsLoading(false)
      }
    }
    fetchKits()
  }, [session])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalKits = kits.length
  const trackedLocations = kits.filter(kit => kit.gps_location).length
  const incompleteKits = kits.filter(kit => (kit.item_count || 0) === 0).length
  const readyKits = totalKits - incompleteKits

  const stats = [
    { title: "Total Kits", value: totalKits.toString(), description: "Active emergency kits", icon: Package, color: "text-blue-600" },
    { title: "Kit Locations", value: trackedLocations.toString(), description: "GPS tracked locations", icon: MapPin, color: "text-green-600" },
    { title: "Incomplete Kits", value: incompleteKits.toString(), description: "Kits with no items", icon: AlertTriangle, color: "text-orange-600" },
    { title: "Ready Kits", value: readyKits.toString(), description: "Kits with items", icon: CheckCircle, color: "text-emerald-600" },
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
