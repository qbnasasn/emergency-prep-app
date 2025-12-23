"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import PrintablePlan from "@/components/plans/printable-plan"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import Map from "@/components/maps/Map"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PlanViewPage() {
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const [html2pdf, setHtml2pdf] = useState<any>(null)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)
  const params = useParams()
  const planId = params.id

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('html2pdf.js').then(module => {
        setHtml2pdf(() => module.default);
      }).catch(err => {
        console.error("Failed to load html2pdf.js", err);
      });
    }
  }, []);

  useEffect(() => {
    if (planId) {
      setIsLoading(true)
      fetch(`/api/plans/full?id=${planId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch plan");
          return res.json();
        })
        .then((data) => {
          setPlan(data)
          if (data.routes && data.routes.length > 0) {
            setSelectedRoute(data.routes[0])
          }
          setIsLoading(false)
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
          toast.error("Failed to load plan details.");
        })
    }
  }, [planId])

  const handlePrint = () => {
    if (!html2pdf || !plan) {
      console.error("html2pdf.js has not loaded yet or no plan data.");
      toast.error("PDF generator is initializing. Please try again in a moment.");
      return;
    }
    setIsPrinting(true);
    const element = document.getElementById("printable-plan-view");
    if (!element) {
      console.error("Element not found");
      setIsPrinting(false);
      return;
    }

    const opt = {
      margin: 0.5,
      filename: `emergency-plan-${plan.name.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, allowTaint: false }, // useCORS is important for Google Maps
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    try {
      html2pdf()
        .from(element)
        .set(opt)
        .save()
        .then(() => {
          toast.success("PDF downloaded successfully.");
        })
        .catch((err: any) => {
          console.error("PDF generation failed in promise", err);
          toast.error("Failed to generate PDF. Please try again.");
        })
        .finally(() => setIsPrinting(false));
    } catch (err) {
      console.error("PDF generation initialization failed", err);
      toast.error("Failed to initialize PDF generator.");
      setIsPrinting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    )
  }

  if (!plan) {
    return <div>Plan not found.</div>
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <Link href="/dashboard/plans">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" />Back to Plans</Button>
        </Link>
        <h1 className="text-xl font-bold">Plan Details</h1>
        <Button onClick={handlePrint} disabled={isPrinting}>
          {isPrinting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Download PDF
        </Button>
      </header>
      <main className="p-8">
        <main className="p-8 space-y-8">
          {/* Interactive Route Viewer (User Requested) */}
          {plan.routes && plan.routes.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Interactive Route Map</h2>
                <div className="w-64">
                  <Select
                    defaultValue={plan.routes[0]?.id}
                    onValueChange={(val) => {
                      // Force re-render of map or update state if needed
                      const r = plan.routes.find((r: any) => r.id === val);
                      setSelectedRoute(r);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      {plan.routes.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="h-96 w-full bg-slate-100 rounded-md overflow-hidden border">
                {selectedRoute ? (
                  <Map waypoints={selectedRoute.waypoints} />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">Select a route to view</div>
                )}
              </div>
              {selectedRoute && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Detailed Waypoints:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoute.waypoints.map((wp: any, idx: number) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                        {idx + 1}. {wp.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div id="printable-plan-view">
            <PrintablePlan plan={plan} />
          </div>
        </main>
    </div>
  )
}
