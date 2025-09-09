"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MedicalNeedForm } from "./medical-need-form"
import { Plus, Trash2, Edit } from "lucide-react"

type MedicalNeed = {
  id: string;
  condition: string;
  medication: string;
  dosage: string;
  frequency: string;
  notes: string;
};

export function MedicalNeedsDialog({ familyMember, onOpenChange, open }) {
  const [medicalNeeds, setMedicalNeeds] = useState<MedicalNeed[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<MedicalNeed | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchMedicalNeeds = async () => {
    if (!familyMember) return;
    try {
      const response = await fetch(`/api/family-members/${familyMember.id}/medical-needs`);
      if (!response.ok) {
        throw new Error('Failed to fetch medical needs');
      }
      const data = await response.json();
      setMedicalNeeds(data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedicalNeeds();
    }
  }, [open, familyMember]);

  const handleFormSubmit = async (values) => {
    const method = selectedNeed ? 'PUT' : 'POST';
    // We need an API route for individual medical needs to be able to update/delete
    const url = selectedNeed
      ? `/api/family-members/${familyMember.id}/medical-needs/${selectedNeed.id}`
      : `/api/family-members/${familyMember.id}/medical-needs`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to save medical need`);
      }
      toast.success('Medical need saved successfully!');
      setIsFormOpen(false);
      fetchMedicalNeeds();
    } catch (error) {
      toast.error(error.message);
    }
  };

    const handleDelete = async (needId: string) => {
    // We need an API route for this
    try {
      const response = await fetch(`/api/family-members/${familyMember.id}/medical-needs/${needId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete medical need');
      }
      toast.success('Medical need deleted.');
      fetchMedicalNeeds();
    } catch (error) {
      toast.error(error.message);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Medical Needs for {familyMember?.first_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {medicalNeeds.map(need => (
            <div key={need.id} className="border p-4 rounded-lg flex justify-between items-start">
              <div>
                <p className="font-semibold">{need.condition}</p>
                <p className="text-sm text-muted-foreground">{need.medication} - {need.dosage} ({need.frequency})</p>
                <p className="text-sm text-muted-foreground mt-1">{need.notes}</p>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={() => { setSelectedNeed(need); setIsFormOpen(true); }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(need.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {isFormOpen ? (
            <MedicalNeedForm onFormSubmit={handleFormSubmit} initialData={selectedNeed} />
        ) : (
            <Button onClick={() => { setSelectedNeed(null); setIsFormOpen(true); }} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Medical Need
            </Button>
        )}

      </DialogContent>
    </Dialog>
  )
}
