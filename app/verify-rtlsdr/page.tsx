import { WebRtlsdrInterface } from "@/components/communications/web-rtlsdr-interface"

export default function VerifyPage() {
  return (
    <div className="p-10 container mx-auto">
      <h1 className="text-2xl mb-4">Verification Page</h1>
      <WebRtlsdrInterface />
    </div>
  )
}
