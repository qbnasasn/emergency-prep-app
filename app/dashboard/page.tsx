import { WeatherAlerts } from "@/components/dashboard/weather-alerts"
import { EmergencyMap } from "@/components/dashboard/emergency-map"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { KnowledgeTips } from "@/components/dashboard/knowledge-tips"
import { RssAlertBanner } from "@/components/dashboard/rss-alert-banner"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-foreground mb-2">Dashboard</h1>
        <p className="font-body text-muted-foreground text-lg">Stay Informed. Stay Prepared.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RssAlertBanner />
          <WeatherAlerts />
          <EmergencyMap />
        </div>
        <div className="space-y-6">
          <SummaryCards />
          <KnowledgeTips />
        </div>
      </div>
    </div>
  )
}
