"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"

const initialSummaryData = [
  {
    title: "Inventory Items",
    value: "...",
    change: "Loading...",
    icon: Package,
    color: "text-primary",
  },
  {
    title: "Active Alerts",
    value: "...",
    change: "Loading...",
    icon: AlertTriangle,
    color: "text-primary",
  },
  {
    title: "Emergency Kits",
    value: "...",
    change: "Loading...",
    icon: CheckCircle,
    color: "text-primary",
  },
  {
    title: "Expiring Soon",
    value: "...",
    change: "Loading...",
    icon: Clock,
    color: "text-destructive",
  },
]

export function SummaryCards() {
  const [summaryData, setSummaryData] = useState(initialSummaryData)

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const [inventoryRes, kitsRes, alertsRes] = await Promise.all([
          fetch("/api/inventory"),
          fetch("/api/kits"),
          fetch("/api/noaa-alerts"),
        ])

        if (!inventoryRes.ok || !kitsRes.ok || !alertsRes.ok) {
          throw new Error("Failed to fetch summary data")
        }

        const inventoryData = await inventoryRes.json()
        const kitsData = await kitsRes.json()
        const alertsData = await alertsRes.json()

        const expiringSoonCount = inventoryData.filter((inventoryItem: any) => {
          if (!inventoryItem.expiry_date) return false
          const today = new Date()
          const expiration = new Date(inventoryItem.expiry_date)
          const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 3600 * 24))
          return daysUntilExpiration > 0 && daysUntilExpiration <= 30
        }).length

        const newSummaryData = initialSummaryData.map((item) => {
          switch (item.title) {
            case "Inventory Items":
              return { ...item, value: inventoryData.length.toString(), change: "Total items" }
            case "Active Alerts":
              return { ...item, value: alertsData.length.toString(), change: `${alertsData.length} weather alerts` }
            case "Emergency Kits":
              return { ...item, value: kitsData.length.toString(), change: "Total kits" }
            case "Expiring Soon":
              return { ...item, value: expiringSoonCount.toString(), change: "Next 30 days" }
            default:
              return item
          }
        })

        setSummaryData(newSummaryData)
      } catch (error) {
        console.error("Failed to fetch summary data", error)
        // You could set an error state here and display it in the UI for each card
      }
    }

    fetchSummaryData()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="font-heading font-bold text-lg text-foreground">Quick Overview</h2>
      {summaryData.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-body text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-heading font-bold text-foreground">{item.value}</div>
            <p className="text-xs text-muted-foreground font-body">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
