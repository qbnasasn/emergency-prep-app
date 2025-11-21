"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Rss, BriefcaseMedical, Satellite, Users } from "lucide-react"
import { RssFeedManager } from "@/components/communications/rss-manager"

export function CommunicationsOverview() {
  const [stats, setStats] = useState({
    contacts: 0,
    plans: 0,
    kits: 0,
    alerts: 0,
    rssCount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch database stats
        const dbRes = await fetch('/api/communications/stats')
        const dbData = await dbRes.json()

        // Fetch NOAA alerts count (just length of current alerts)
        const noaaRes = await fetch('/api/noaa-alerts')
        const noaaData = await noaaRes.json()
        const alertCount = Array.isArray(noaaData) ? noaaData.length : 0

        setStats(prev => ({
          ...prev,
          contacts: dbData.contacts || 0,
          plans: dbData.plans || 0,
          kits: dbData.kits || 0,
          alerts: alertCount
        }))
      } catch (error) {
        console.error("Failed to fetch communication stats", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRssUpdate = (count: number) => {
    setStats(prev => ({ ...prev, rssCount: count }))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Ready Plans & Kits */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-body text-sm font-medium text-muted-foreground">Ready Plans & Kits</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <BriefcaseMedical className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-heading font-bold text-foreground">
            {stats.plans + stats.kits}
          </div>
          <p className="text-xs text-muted-foreground font-body mt-1">
            {stats.plans} plans, {stats.kits} kits ready
          </p>
        </CardContent>
      </Card>

      {/* RSS Updates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-body text-sm font-medium text-muted-foreground">RSS Updates</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Rss className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-heading font-bold text-foreground">
            {stats.rssCount}
          </div>
          <div className="flex items-center justify-between mt-1">
             <p className="text-xs text-muted-foreground font-body">Latest items</p>
             <div className="-mt-6">
                 <RssFeedManager onUpdateCount={handleRssUpdate} />
             </div>
          </div>
        </CardContent>
      </Card>

      {/* NOAA Weather */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-body text-sm font-medium text-muted-foreground">NOAA Weather</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Satellite className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-heading font-bold text-foreground">
            {stats.alerts}
          </div>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Active alerts in your area
          </p>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-body text-sm font-medium text-muted-foreground">Emergency Contacts</CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-heading font-bold text-foreground">
            {stats.contacts}
          </div>
          <p className="text-xs text-muted-foreground font-body mt-1">
            Ready to reach
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
