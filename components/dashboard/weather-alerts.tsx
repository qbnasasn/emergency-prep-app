"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Sun, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WeatherAlert {
  id: string
  title: string
  severity: "minor" | "moderate" | "severe" | "extreme"
  description: string
  area: string
  expires: string
}

export function WeatherAlerts() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Mock NOAA weather alerts data
  useEffect(() => {
    const mockAlerts: WeatherAlert[] = [
      {
        id: "1",
        title: "Winter Weather Advisory",
        severity: "moderate",
        description: "Snow and ice expected. Travel may be difficult.",
        area: "Your Area",
        expires: "2025-01-09T18:00:00Z",
      },
      {
        id: "2",
        title: "High Wind Warning",
        severity: "severe",
        description: "Damaging winds up to 70 mph possible.",
        area: "Regional",
        expires: "2025-01-09T12:00:00Z",
      },
    ]

    setTimeout(() => {
      setAlerts(mockAlerts)
      setLoading(false)
    }, 1000)
  }, [])

  const refreshAlerts = () => {
    setLoading(true)
    setLastUpdated(new Date())
    // TODO: Implement actual NOAA API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "bg-blue-100 text-blue-800"
      case "moderate":
        return "bg-yellow-100 text-yellow-800"
      case "severe":
        return "bg-orange-100 text-orange-800"
      case "extreme":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <CardTitle className="font-heading text-xl">Weather Alerts</CardTitle>
        </div>
        <Button variant="ghost" size="sm" onClick={refreshAlerts} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-body font-semibold text-foreground">{alert.title}</h3>
                  <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                </div>
                <p className="font-body text-sm text-muted-foreground mb-2">{alert.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Area: {alert.area}</span>
                  <span>Expires: {new Date(alert.expires).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground font-body">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sun className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="font-body text-muted-foreground">No active weather alerts in your area</p>
            <p className="font-body text-sm text-muted-foreground mt-1">Stay prepared and check back regularly</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
