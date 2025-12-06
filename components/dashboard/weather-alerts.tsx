"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Sun, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"

interface WeatherAlert {
  id: string
  title: string
  severity: string
  description: string
  area: string
  expires: string
}

export function WeatherAlerts() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null)

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/noaa-alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch weather alerts.');
      }
      const data = await response.json();
      setAlerts(data);
      setLastUpdated(new Date());
    } catch (error) {
        if(error instanceof Error) {
            toast.error(error.message);
        } else {
            toast.error("An unknown error occurred.");
        }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [])

  const refreshAlerts = () => {
    fetchAlerts();
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
        return "bg-muted text-foreground"
    }
  }

  return (
    <>
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
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-4 pr-2">
                    {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedAlert(alert)}
                    >
                        <div className="flex items-start justify-between mb-2">
                        <h3 className="font-body font-semibold text-foreground">{alert.title}</h3>
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        </div>
                        <p className="font-body text-sm text-muted-foreground mb-2 line-clamp-3">
                            {alert.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Area: {alert.area}</span>
                        <span>Expires: {new Date(alert.expires).toLocaleDateString()}</span>
                        </div>
                    </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground font-body pt-2">Last updated: {lastUpdated.toLocaleTimeString()}</p>
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

        <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
            <DialogContent className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl font-heading">{selectedAlert?.title}</DialogTitle>
                        {selectedAlert && <Badge className={getSeverityColor(selectedAlert.severity)}>{selectedAlert.severity}</Badge>}
                    </div>
                    <DialogDescription>
                        Issued for {selectedAlert?.area}
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4 font-body">
                    <div className="text-sm text-muted-foreground">
                        Expires: {selectedAlert ? new Date(selectedAlert.expires).toLocaleString() : ''}
                    </div>
                    <div className="whitespace-pre-wrap text-foreground">
                        {selectedAlert?.description}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </>
  )
}
