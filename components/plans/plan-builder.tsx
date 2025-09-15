"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { EmergencyPlan } from "./plans-list"
import { FamilyTab, FamilyMember } from "./family-tab"
import { LocationsTab } from "./locations-tab"
import { Loader2 } from "lucide-react"

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
}

const hazardTypes = [
  "Severe Weather", "Earthquake", "Wildfire", "Flood", "Hurricane", "Tornado",
  "Winter Storm", "Power Outage", "Chemical Spill", "Terrorism", "Pandemic", "Cyber Attack",
]

interface PlanBuilderProps {
  plan?: EmergencyPlan | null
  onSave: (planData: any, contactIds: string[], petIds: string[]) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

export function PlanBuilder({ plan, onSave, onCancel, isSaving }: PlanBuilderProps) {
  // Form state
  const [planName, setPlanName] = useState("")
  const [description, setDescription] = useState("")
  const [hazardType, setHazardType] = useState("")

  // Tab-specific state
  const [allFamilyMembers, setAllFamilyMembers] = useState<FamilyMember[]>([])
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set())
  const [allPets, setAllPets] = useState<any[]>([]) // Define a proper Pet type later
  const [selectedPetIds, setSelectedPetIds] = useState<Set<string>>(new Set())

  // Component state
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const membersResponse = await fetch('/api/family-members');
            if (!membersResponse.ok) throw new Error('Failed to fetch family members');
            const membersData = await membersResponse.json();
            setAllFamilyMembers(membersData);

            const petsResponse = await fetch('/api/pets');
            if (!petsResponse.ok) throw new Error('Failed to fetch pets');
            const petsData = await petsResponse.json();
            setAllPets(petsData);

            if (plan) {
                setPlanName(plan.name);
                setDescription(plan.description || "");
                setHazardType(plan.hazard_type);

                const contactsResponse = await fetch(`/api/plans/${plan.id}/contacts`);
                if (!contactsResponse.ok) throw new Error('Failed to fetch plan contacts');
                const contactsData: FamilyMember[] = await contactsResponse.json();
                setSelectedMemberIds(new Set(contactsData.map(m => m.id)));

                const planPetsResponse = await fetch(`/api/plans/${plan.id}/pets`);
                if (!planPetsResponse.ok) throw new Error('Failed to fetch plan pets');
                const planPetsData: Pet[] = await planPetsResponse.json();
                setSelectedPetIds(new Set(planPetsData.map(p => p.id)));

            } else {
                // This case may no longer be hit if we pre-create plans, but good for safety
                setPlanName("");
                setDescription("");
                setHazardType("");
                setSelectedMemberIds(new Set());
                setSelectedPetIds(new Set());
            }
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    fetchInitialData();
    setActiveTab("basic");
  }, [plan])

  const handleFamilySelectionChange = (memberId: string) => {
    setSelectedMemberIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(memberId)) {
            newSet.delete(memberId);
        } else {
            newSet.add(memberId);
        }
        return newSet;
    });
  };

  const handlePetSelectionChange = (petId: string) => {
    setSelectedPetIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(petId)) {
            newSet.delete(petId);
        } else {
            newSet.add(petId);
        }
        return newSet;
    });
  };

  const handleSave = () => {
    if (!planName || !hazardType) {
      toast.error("Plan Name and Hazard Type are required.");
      return;
    }

    const planData = {
      name: planName,
      description: description,
      hazard_type: hazardType,
    };

    onSave(planData, Array.from(selectedMemberIds), Array.from(selectedPetIds));
  }

  if (isLoading) {
    return (
        <div className="flex justify-center items-center p-8 h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="family">Family & Pets</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="inventory" disabled>Inventory</TabsTrigger>
          <TabsTrigger value="routes" disabled>Routes</TabsTrigger>
          <TabsTrigger value="contacts" disabled>Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="plan-name" className="font-body font-medium">Plan Name</Label>
                  <Input id="plan-name" placeholder="Enter plan name" value={planName} onChange={(e) => setPlanName(e.target.value)} className="font-body" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hazard-type" className="font-body font-medium">Hazard Type</Label>
                  <Select value={hazardType} onValueChange={setHazardType}>
                    <SelectTrigger className="font-body"><SelectValue placeholder="Select hazard type" /></SelectTrigger>
                    <SelectContent>
                      {hazardTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, "-")}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-body font-medium">Plan Description</Label>
                <Textarea id="description" placeholder="Describe the purpose and scope of this emergency plan" className="font-body" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="family">
            <Card>
                <CardContent className="pt-6">
                    <FamilyTab
                        allFamilyMembers={allFamilyMembers}
                        selectedMemberIds={selectedMemberIds}
                        onSelectionChange={handleFamilySelectionChange}
                        allPets={allPets}
                        selectedPetIds={selectedPetIds}
                        onPetSelectionChange={handlePetSelectionChange}
                    />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="locations">
            <Card>
                <CardContent className="pt-6">
                    <LocationsTab planId={plan?.id} />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="inventory"><p className="text-center p-4 text-muted-foreground">Inventory management coming soon.</p></TabsContent>
        <TabsContent value="routes"><p className="text-center p-4 text-muted-foreground">Routes management coming soon.</p></TabsContent>
        <TabsContent value="contacts"><p className="text-center p-4 text-muted-foreground">Contacts management coming soon.</p></TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
        </Button>
      </div>
    </div>
  )
}
