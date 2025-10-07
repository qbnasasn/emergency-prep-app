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
        const inventoryRes = await fetch("/api/inventory")
        const kitsRes = await fetch("/api/kits")
        const alertsRes = await fetch("/api/noaa-alerts")
        const expiringSoonRes = await fetch("/api/inventory/expiring-soon")

        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json()
          setSummaryData((prevData) =>
            prevData.map((item) =>
              item.title === "Inventory Items"
                ? { ...item, value: inventoryData.length.toString(), change: `Total items` }
                : item,
            ),
          )
        }

        if (kitsRes.ok) {
          const kitsData = await kitsRes.json()
          setSummaryData((prevData) =>
            prevData.map((item) =>
              item.title === "Emergency Kits"
                ? { ...item, value: kitsData.length.toString(), change: `Total kits` }
                : item,
            ),
          )
        }

        if (alertsRes.ok) {
          const alertsData = await alertsRes.json()
          setSummaryData((prevData) =>
            prevData.map((item) =>
              item.title === "Active Alerts"
                ? { ...item, value: alertsData.length.toString(), change: `${alertsData.length} weather alerts` }
                : item,
            ),
          )
        }

        if (expiringSoonRes.ok) {
          const expiringSoonData = await expiringSoonRes.json()
          setSummaryData((prevData) =>
            prevData.map((item) =>
              item.title === "Expiring Soon"
                ? { ...item, value: expiringSoonData.count.toString(), change: `Next 30 days` }
                : item,
            ),
          )
        }
      } catch (error) {
        console.error("Failed to fetch summary data", error)
        // You could set an error state here and display it in the UI
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
