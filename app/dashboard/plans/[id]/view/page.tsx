"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import PrintablePlan from "@/components/plans/printable-plan"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PlanViewPage() {
  const [plan, setPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)
  const [html2pdf, setHtml2pdf] = useState<any>(null)
  const params = useParams()
  const planId = params.id

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('html2pdf.js').then(module => {
        setHtml2pdf(() => module.default);
      });
    }
  }, []);

  useEffect(() => {
    if (planId) {
      setIsLoading(true)
      fetch(`/api/plans/full?id=${planId}`)
        .then((res) => res.json())
        .then((data) => {
          setPlan(data)
          setIsLoading(false)
        })
    }
  }, [planId])

  const handlePrint = () => {
    if (!html2pdf || !plan) {
      console.error("html2pdf.js has not loaded yet or no plan data.");
      return;
    }
    setIsPrinting(true);
    const element = document.getElementById("printable-plan-view");
    const opt = {
      margin: 0.5,
      filename: `emergency-plan.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };
    html2pdf().from(element).set(opt).save().finally(() => setIsPrinting(false));
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
        <div id="printable-plan-view">
          <PrintablePlan plan={plan} />
        </div>
      </main>
    </div>
  )
}
