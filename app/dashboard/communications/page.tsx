import { CommunicationsHeader } from "@/components/communications/communications-header"
import { CommunicationsOverview } from "@/components/communications/communications-overview"
import { MeshtasticInterface } from "@/components/communications/meshtastic-interface"
import { RadioGuides } from "@/components/communications/radio-guides"
import { WebRtlsdrInterface } from "@/components/communications/web-rtlsdr-interface"

export default function CommunicationsPage() {
  return (
    <div className="space-y-6">
      <CommunicationsHeader />
      <CommunicationsOverview />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <MeshtasticInterface />
          <WebRtlsdrInterface />
        </div>
        <div>
          <RadioGuides />
        </div>
      </div>
    </div>
  )
}
