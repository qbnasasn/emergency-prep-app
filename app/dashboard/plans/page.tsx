"use client"

import { useState, useEffect } from "react"
import { PlansHeader } from "@/components/plans/plans-header"
import { PlansOverview } from "@/components/plans/plans-overview"
import { PlansList, EmergencyPlan } from "@/components/plans/plans-list"
import { PlanBuilder } from "@/components/plans/plan-builder"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function PlansPage() {
  const [plans, setPlans] = useState<EmergencyPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<EmergencyPlan | null>(null)

  const fetchPlans = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/plans")
      if (!response.ok) {
        throw new Error("Failed to fetch plans")
      }
      const data = await response.json()
      setPlans(data)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleCreate = () => {
    setSelectedPlan(null)
    setIsModalOpen(true)
  }

  const handleEdit = (plan: EmergencyPlan) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPlan(null)
  }

  const handleSave = (savedPlan: EmergencyPlan) => {
    fetchPlans() // Refresh the list
    handleCloseModal()
  }

  const handleDelete = async (planId: string) => {
    try {
        const response = await fetch(`/api/plans/${planId}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Failed to delete plan');
        }
        toast.success('Plan deleted successfully');
        fetchPlans(); // Refresh the list
    } catch (err: any) {
        toast.error(err.message);
    }
  };


  return (
    <div className="space-y-6">
      <PlansHeader onCreate={handleCreate} />
      <PlansOverview />
      <PlansList
        plans={plans}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        error={error}
        fetchPlans={fetchPlans}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
          </DialogHeader>
          <PlanBuilder
            plan={selectedPlan}
            onSave={handleSave}
            onCancel={handleCloseModal}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
