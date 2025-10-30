"use client"

import { useState, useEffect } from "react"
import { createRoot } from "react-dom/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, Play, Printer, Loader2, AlertTriangle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import PrintablePlan from './printable-plan';

export interface EmergencyPlan {
  id: string
  name: string
  description: string | null
  hazard_type: string
  is_active: boolean
  created_at: string
  updated_at?: string;
  contacts_count?: number;
  pets_count?: number;
  locations_count?: number;
  items_count?: number;
}

interface PlansListProps {
  plans: EmergencyPlan[];
  onEdit: (plan: EmergencyPlan) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  fetchPlans: () => void;
}

export function PlansList({ plans, onEdit, onDelete, onActivate, onDeactivate, isLoading, error, fetchPlans }: PlansListProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [html2pdf, setHtml2pdf] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('html2pdf.js').then(module => {
        setHtml2pdf(() => module.default);
      });
    }
  }, []);

  const handlePrint = async (planId: string) => {
    if (!html2pdf) {
      console.error("html2pdf.js has not loaded yet.");
      return;
    }

    setIsPrinting(true);
    try {
      const response = await fetch(`/api/plans/full?id=${planId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch plan details');
      }
      const planDetails = await response.json();

      const printElement = document.createElement('div');
      document.body.appendChild(printElement);

      const root = createRoot(printElement);
      root.render(<PrintablePlan plan={planDetails} />);

      // Allow time for the component to render before generating the PDF
      setTimeout(() => {
        const opt = {
          margin:       0.5,
          filename:     `${planDetails.name}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().from(printElement).set(opt).toPdf().get('pdf').then(function (pdf: any) {
          pdf.autoPrint();
          const blob = pdf.output('bloburl');
          window.open(blob, '_blank');
        }).finally(() => {
          root.unmount();
          document.body.removeChild(printElement);
          setIsPrinting(false);
        });
      }, 500); // A short delay to ensure rendering is complete

    } catch (err) {
      console.error("Printing failed", err);
      setIsPrinting(false);
    }
  };

  const getStatus = (isActive: boolean) => {
    return isActive ? "Active" : "Draft"
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-muted text-foreground"
  }

  const getHazardColor = (hazardType: string) => {
    const colors = [
      "bg-blue-100 text-blue-800", "bg-orange-100 text-orange-800", "bg-red-100 text-red-800",
      "bg-purple-100 text-purple-800", "bg-green-100 text-green-800", "bg-yellow-100 text-yellow-800",
      "bg-indigo-100 text-indigo-800", "bg-pink-100 text-pink-800",
    ]
    const hash = hazardType.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-40 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>{error}</p>
        <Button onClick={fetchPlans} variant="link">Try again</Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Your Emergency Plans</CardTitle>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <p>You haven&apos;t created any plans yet.</p>
            <p className="text-sm">Click &quot;New Plan&quot; to get started.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className="border border-border flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-body font-semibold text-lg text-foreground">{plan.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getHazardColor(plan.hazard_type)}>{plan.hazard_type}</Badge>
                      <Badge className={getStatusColor(plan.is_active)}>{getStatus(plan.is_active)}</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="font-body" onClick={() => onEdit(plan)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem className="font-body" onClick={() => handlePrint(plan.id)} disabled={isPrinting}>
                        {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Print Plan
                      </DropdownMenuItem>
                      <DropdownMenuItem className="font-body text-destructive" onClick={() => onDelete(plan.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Plan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex-grow flex flex-col justify-between">
                <p className="text-sm font-body text-muted-foreground h-10 overflow-hidden mb-3">
                  {plan.description || "No description provided."}
                </p>
                <div className="space-y-3">
                  <div className="text-xs font-body text-muted-foreground">
                    Last updated: {formatDate(plan.updated_at || plan.created_at)}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 font-body bg-transparent"
                      onClick={() => onEdit(plan)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {plan.is_active ? (
                       <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDeactivate(plan.id)}
                        className="flex-1 font-body"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onActivate(plan.id)}
                        className="flex-1 font-body bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  )
}
