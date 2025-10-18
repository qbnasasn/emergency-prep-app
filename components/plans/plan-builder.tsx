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
import { InventoryTab } from "./inventory-tab"
import { RoutesTab, Route } from "./routes-tab"
import { Loader2 } from "lucide-react"

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  street_number: string;
  street_name: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
  latitude?: number;
  longitude?: number;
}

const hazardTypes = [
  "Severe Weather", "Earthquake", "Wildfire", "Flood", "Hurricane", "Tornado",
  "Winter Storm", "Power Outage", "Chemical Spill", "Terrorism", "Pandemic", "Cyber Attack",
]

interface PlanBuilderProps {
  plan?: EmergencyPlan | null
  onSave: (planData: any, contactIds: string[], petIds: string[], itemIds: string[], kitIds: string[], routes: Route[]) => Promise<void>
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
  const [allPets, setAllPets] = useState<any[]>([])
  const [selectedPetIds, setSelectedPetIds] = useState<Set<string>>(new Set())
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set())
  const [selectedKitIds, setSelectedKitIds] = useState<Set<string>>(new Set())
  const [routes, setRoutes] = useState<Route[]>([])
  const [locations, setLocations] = useState<Location[]>([])

  // Component state
  const [isLoading, setIsLoading] = useState(true)

  const parseLocations = (locationsData: Location[]) => {
    return locationsData.map(loc => ({
      ...loc,
      latitude: loc.latitude ? parseFloat(loc.latitude as any) : undefined,
      longitude: loc.longitude ? parseFloat(loc.longitude as any) : undefined,
    }));
  };
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            // Fetch static data
            const membersPromise = fetch('/api/family-members').then(res => res.json());
            const petsPromise = fetch('/api/pets').then(res => res.json());

            const [membersData, petsData] = await Promise.all([membersPromise, petsPromise]);
            setAllFamilyMembers(membersData);
            setAllPets(petsData);

            // Fetch plan-specific data
            if (plan) {
                setPlanName(plan.name);
                setDescription(plan.description || "");
                setHazardType(plan.hazard_type);

                const contactsPromise = fetch(`/api/plans/${plan.id}/contacts`).then(res => res.json());
                const petsPromise = fetch(`/api/plans/${plan.id}/pets`).then(res => res.json());
                const inventoryPromise = fetch(`/api/plans/${plan.id}/inventory`).then(res => res.json());
                const routesPromise = fetch(`/api/plans/${plan.id}/routes`).then(res => res.json());
                const locationsPromise = fetch(`/api/plans/${plan.id}/locations`).then(res => res.json());

                const [contactsData, planPetsData, inventoryData, routesData, locationsData] = await Promise.all([contactsPromise, petsPromise, inventoryPromise, routesPromise, locationsPromise]);

                setSelectedMemberIds(new Set(contactsData.map((m: FamilyMember) => m.id)));
                setSelectedPetIds(new Set(planPetsData.map((p: Pet) => p.id)));
                setSelectedItemIds(new Set(inventoryData.items.map((i: any) => i.id)));
                setSelectedKitIds(new Set(inventoryData.kits.map((k: any) => k.id)));
                setRoutes(routesData);
                setLocations(parseLocations(locationsData));

            } else {
                setPlanName("");
                setDescription("");
                setHazardType("");
                setSelectedMemberIds(new Set());
                setSelectedPetIds(new Set());
                setSelectedItemIds(new Set());
                setSelectedKitIds(new Set());
                setRoutes([]);
                setLocations([]);
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
        if (newSet.has(memberId)) newSet.delete(memberId);
        else newSet.add(memberId);
        return newSet;
    });
  };

  const handlePetSelectionChange = (petId: string) => {
    setSelectedPetIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(petId)) newSet.delete(petId);
        else newSet.add(petId);
        return newSet;
    });
  };

  const handleItemSelectionChange = (itemId: string) => {
    setSelectedItemIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) newSet.delete(itemId);
        else newSet.add(itemId);
        return newSet;
    });
  };

  const handleKitSelectionChange = (kitId: string) => {
    setSelectedKitIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(kitId)) newSet.delete(kitId);
        else newSet.add(kitId);
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

    onSave(
      planData,
      Array.from(selectedMemberIds),
      Array.from(selectedPetIds),
      Array.from(selectedItemIds),
      Array.from(selectedKitIds),
      routes
    );
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="family">Contacts & Pets</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
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
                    <LocationsTab
                        planId={plan?.id}
                        locations={locations}
                        fetchLocations={() => {
                            if (plan?.id) {
                                fetch(`/api/plans/${plan.id}/locations`)
                                    .then(res => res.json())
                                    .then(data => setLocations(parseLocations(data)));
                            }
                        }}
                    />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="inventory">
            <Card>
                <CardContent className="pt-6">
                    <InventoryTab
                        planId={plan?.id}
                        selectedItemIds={selectedItemIds}
                        onItemSelectionChange={handleItemSelectionChange}
                        selectedKitIds={selectedKitIds}
                        onKitSelectionChange={handleKitSelectionChange}
                    />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="routes">
            {activeTab === 'routes' && (
                <Card>
                    <CardContent className="pt-6">
                        <RoutesTab
                            planId={plan?.id}
                            routes={routes}
                            onRoutesChange={setRoutes}
                            locations={locations}
                        />
                    </CardContent>
                </Card>
            )}
        </TabsContent>
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
