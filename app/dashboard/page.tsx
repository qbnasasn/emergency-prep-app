import { WeatherAlerts } from "@/components/dashboard/weather-alerts"
import { EmergencyMap } from "@/components/dashboard/emergency-map"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { KnowledgeTips } from "@/components/dashboard/knowledge-tips"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="font-heading font-black text-3xl text-gray-900 mb-2">Dashboard</h1>
        <p className="font-body text-gray-600 text-lg">Stay Informed. Stay Prepared.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
