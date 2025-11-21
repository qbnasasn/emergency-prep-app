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
  const [isSaving, setIsSaving] = useState(false)
  const [isNewPlan, setIsNewPlan] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchPlans = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/plans/full")
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

  const handleCreate = async () => {
    try {
        const planPayload = {
            name: 'New Untitled Plan',
            description: 'Describe your plan here.',
            hazard_type: 'severe-weather', // Default value
            is_active: false
        };
        const planResponse = await fetch('/api/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planPayload),
        });
        if (!planResponse.ok) throw new Error('Failed to create new draft plan.');
        const newPlan = await planResponse.json();

        toast.info("New draft plan created. You can now edit the details.");
        fetchPlans(); // Refresh list to show the new draft
        setSelectedPlan(newPlan);
        setIsNewPlan(true); // Mark this as a new plan
        setIsModalOpen(true);
    } catch (err: any) {
        toast.error(err.message);
    }
  }

  const handleEdit = (plan: EmergencyPlan) => {
    setSelectedPlan(plan)
    setIsNewPlan(false); // This is an existing plan
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    if (isNewPlan && selectedPlan) {
        handleDelete(selectedPlan.id);
        toast.info("New plan creation cancelled.");
    }
    setIsModalOpen(false)
    setSelectedPlan(null)
    setIsNewPlan(false);
  }

  const handleSave = async (
    planData: any,
    contactIds: string[],
    petIds: string[],
    selectedItemIds: string[],
    selectedKitIds: string[],
    routes: any[]
  ) => {
    if (!selectedPlan) {
        toast.error("Cannot save, no plan is selected.");
        return;
    }

    setIsSaving(true);
    try {
        // Step 1: Update the plan details (must be done first)
        const planResponse = await fetch(`/api/plans/${selectedPlan.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planData),
        });
        if (!planResponse.ok) throw new Error('Failed to update plan details.');
        const updatedPlan = await planResponse.json();

        // Step 2: Update related items in parallel
        const contactsPromise = fetch(`/api/plans/${selectedPlan.id}/contacts`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contactIds }),
        });

        const petsPromise = fetch(`/api/plans/${selectedPlan.id}/pets`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ petIds }),
        });

        const inventoryPromise = fetch(`/api/plans/${selectedPlan.id}/inventory`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selectedItemIds, selectedKitIds }),
        });

        const routesPromise = fetch(`/api/plans/${selectedPlan.id}/routes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ routes }),
        });

        const results = await Promise.all([contactsPromise, petsPromise, inventoryPromise, routesPromise]);

        for (const response of results) {
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
                throw new Error(`Failed to update plan components: ${errorData.message || response.statusText}`);
            }
        }

        toast.success(`Plan '${updatedPlan.name}' saved successfully!`);
        setIsNewPlan(false); // The plan is no longer "new" after a successful save
        handleCloseModal();
        fetchPlans();

    } catch (err: any) {
        toast.error(err?.message || 'An unknown error occurred while saving the plan.');
    } finally {
        setIsSaving(false);
    }
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

  const handleActivate = async (planId: string) => {
    try {
        const response = await fetch(`/api/plans/${planId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: true }),
        });
        if (!response.ok) {
            throw new Error('Failed to activate plan');
        }
        toast.success('Plan activated successfully');
        fetchPlans(); // Refresh the list
    } catch (err: any) {
        toast.error(err.message);
    }
  };

  const handleDeactivate = async (planId: string) => {
    try {
        const response = await fetch(`/api/plans/${planId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: false }),
        });
        if (!response.ok) {
            throw new Error('Failed to deactivate plan');
        }
        toast.success('Plan deactivated successfully');
        fetchPlans(); // Refresh the list
    } catch (err: any) {
        toast.error(err.message);
    }
  };


  return (
    <div className="space-y-6">
      <PlansHeader onCreate={handleCreate} plans={plans} onSearch={setSearchQuery} />
      <PlansOverview plans={plans} />
      <PlansList
        plans={plans}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        isLoading={isLoading}
        error={error}
        fetchPlans={fetchPlans}
        searchQuery={searchQuery}
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
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
