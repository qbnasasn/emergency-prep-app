"use client"

import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Printer, Loader2 } from "lucide-react"
import PrintablePlan from './printable-plan';

interface PlansHeaderProps {
  onCreate: () => void;
  plans: any[]; // Assuming plans are passed as a prop
}

export function PlansHeader({ onCreate, plans }: PlansHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [html2pdf, setHtml2pdf] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('html2pdf.js').then(module => {
        setHtml2pdf(() => module.default);
      });
    }
  }, []);

  const handlePrintAll = async () => {
    if (!html2pdf) {
      console.error("html2pdf.js has not loaded yet.");
      return;
    }

    setIsPrinting(true);
    try {
      const fetchPromises = plans.map(plan =>
        fetch(`/api/plans/full?id=${plan.id}`).then(res => res.json())
      );
      const allPlanDetails = await Promise.all(fetchPromises);

      const printContainer = document.createElement('div');
      document.body.appendChild(printContainer);

      const renderPromises = allPlanDetails.map(planDetails => {
        return new Promise<void>(resolve => {
          const planElement = document.createElement('div');
          printContainer.appendChild(planElement);
          ReactDOM.render(<PrintablePlan plan={planDetails} />, planElement, () => resolve());
        });
      });

      await Promise.all(renderPromises);

      const opt = {
        margin:       0.5,
        filename:     'all_plans.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().from(printContainer).set(opt).toPdf().get('pdf').then(function (pdf: any) {
        pdf.autoPrint();
        const blob = pdf.output('bloburl');
        window.open(blob, '_blank');
      }).finally(() => {
        document.body.removeChild(printContainer);
        setIsPrinting(false);
      });

    } catch (err) {
      console.error("Printing all plans failed", err);
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="font-heading font-black text-3xl text-foreground">Emergency Plans</h1>
        <p className="font-body text-muted-foreground mt-1">NOAA All-Hazards emergency preparedness plans</p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64 font-body"
          />
        </div>

        <Button variant="outline" size="sm" className="font-body bg-transparent">
          <FileText className="h-4 w-4 mr-2" />
          Templates
        </Button>

        <Button variant="outline" size="sm" className="font-body bg-transparent" onClick={handlePrintAll} disabled={isPrinting}>
          {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
          Print All
        </Button>

        <Button className="font-body bg-gray-900 hover:bg-gray-800" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>
    </div>
  )
}
