"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, TrendingUp, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { InventoryItem } from "./inventory-table"

interface InventoryStatsProps {
  items: InventoryItem[]
}

const initialStats = [
  {
    title: "Total Items",
    value: "...",
    change: "Loading...",
    icon: Package,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Low Stock Alerts",
    value: "...",
    change: "Loading...",
    icon: AlertTriangle,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Total Value",
    value: "...",
    change: "Loading...",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Expiring Soon",
    value: "...",
    change: "Loading...",
    icon: Calendar,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
]

export function InventoryStats({ items }: InventoryStatsProps) {
  const [stats, setStats] = useState(initialStats)

  useEffect(() => {
    if (items.length === 0) {
      // Keep loading state if no items are passed yet
      setStats(initialStats)
      return
    }

    const inventoryData = items

    // Calculate stats
    const totalItems = inventoryData.length

    const lowStockCount = inventoryData.filter(
      (item: any) => item.min_stock && item.quantity <= item.min_stock,
    ).length

    const totalValue = inventoryData.reduce((acc: number, item: any) => {
      const cost = item.cost_per_unit || 0
      const quantity = item.quantity || 0
      return acc + cost * quantity
    }, 0)

    const expiringSoonCount = inventoryData.filter((item: any) => {
      if (!item.expiry_date) return false
      const today = new Date()
      const expiration = new Date(item.expiry_date)
      const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 3600 * 24))
      return daysUntilExpiration > 0 && daysUntilExpiration <= 30
    }).length

    // Update state
    const newStats = initialStats.map((stat) => {
      switch (stat.title) {
        case "Total Items":
          return { ...stat, value: totalItems.toString(), change: `Total items in inventory` }
        case "Low Stock Alerts":
          return { ...stat, value: lowStockCount.toString(), change: "Needs attention" }
        case "Total Value":
          return {
            ...stat,
            value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(totalValue),
            change: "Estimated value",
          }
        case "Expiring Soon":
          return { ...stat, value: expiringSoonCount.toString(), change: "Next 30 days" }
        default:
          return stat
      }
    })
    setStats(newStats)
  }, [items])

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
