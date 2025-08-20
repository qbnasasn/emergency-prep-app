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
    value: "...",
    change: "Loading...",
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
  const [summaryData, setSummaryData] = useState(initialSummaryData)

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const inventoryRes = await fetch("/api/inventory")
        const kitsRes = await fetch("/api/kits")

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
      } catch (error) {
        console.error("Failed to fetch summary data", error)
        // You could set an error state here and display it in the UI
      }
    }

    fetchSummaryData()
  }, [])

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
