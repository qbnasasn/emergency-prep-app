"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Plus, MapPin, Users, Package, Route, Heart, Pill, Phone, FileText, AlertTriangle, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FamilyMemberForm } from "./family-member-form"
import { PetForm } from "./pet-form"
import { MedicalNeedsDialog } from "./medical-needs-dialog"
import { PlanLocationForm } from "./plan-location-form"
import { scenarioItems } from "@/lib/scenario-items"
import { Checkbox } from "@/components/ui/checkbox"

const hazardTypes = [
  "Severe Weather Plan",
  "Tornado Plan",
  "Flood Response",
  "Hurricane Plan",
  "Wildfire Evacuation",
  "Winter Storm Plan",
  "Earthquake Plan",
  "Power Outage Plan",
  "Hazardous Materials (HazMat) Response",
  "Active Threat Plan",
  "BugOut Plan",
  "Shelter-In-Place Plan",
  "Medical emergency",
]

interface PlanBuilderProps {
  planId?: string;
}

type FamilyMember = {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  phone_number: string;
  email: string;
};

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  care_instructions: string;
};

export function PlanBuilder({ planId }: PlanBuilderProps) {
  const router = useRouter()
  const [planName, setPlanName] = useState("")
  const [description, setDescription] = useState("")
  const [hazardType, setHazardType] = useState("")
  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isDeleteMemberDialogOpen, setIsDeleteMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [isPetDialogOpen, setIsPetDialogOpen] = useState(false);
  const [isDeletePetDialogOpen, setIsDeletePetDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isMedicalNeedsDialogOpen, setIsMedicalNeedsDialogOpen] = useState(false);
  const [selectedMemberForMedicalNeeds, setSelectedMemberForMedicalNeeds] = useState<FamilyMember | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isDeleteLocationDialogOpen, setIsDeleteLocationDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [planItems, setPlanItems] = useState<any[]>([]);
  const [recommendedItems, setRecommendedItems] = useState<string[]>([]);
  const [planContacts, setPlanContacts] = useState<string[]>([]);
  const reviewContentRef = useRef(null);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
        const [familyRes, petsRes, invRes] = await Promise.all([
            fetch('/api/family-members'),
            fetch('/api/pets'),
            fetch('/api/inventory')
        ]);

        if (!familyRes.ok) throw new Error('Failed to fetch family members');
        setFamilyMembers(await familyRes.json());

        if (!petsRes.ok) throw new Error('Failed to fetch pets');
        setPets(await petsRes.json());

        if (!invRes.ok) throw new Error('Failed to fetch inventory');
        setInventoryItems(await invRes.json());

        if (planId) {
            const [planRes, locRes, planItemsRes, contactsRes] = await Promise.all([
                fetch(`/api/plans/${planId}`),
                fetch(`/api/plans/${planId}/locations`),
                fetch(`/api/plans/${planId}/inventory`),
                fetch(`/api/plans/${planId}/contacts`)
            ]);

            if (!planRes.ok) throw new Error('Failed to fetch plan data');
            const planData = await planRes.json();
            setPlanName(planData.name);
            setDescription(planData.description || "");
            setHazardType(planData.hazard_type || "");
            setIsActive(planData.is_active);

            if (!locRes.ok) throw new Error('Failed to fetch locations');
            setLocations(await locRes.json());

            if (!planItemsRes.ok) throw new Error('Failed to fetch plan items');
            setPlanItems(await planItemsRes.json());

            if (!contactsRes.ok) throw new Error('Failed to fetch plan contacts');
            setPlanContacts(await contactsRes.json());
        }
    } catch (err: any) {
        setError(err.message);
        toast.error(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [planId]);

  useEffect(() => {
    if (hazardType && scenarioItems[hazardType]) {
      setRecommendedItems(scenarioItems[hazardType]);
    } else {
      setRecommendedItems(scenarioItems["Severe Weather Plan"]); // Default
    }
  }, [hazardType]);

  const handleMemberFormSubmit = async (values: any) => {
    const method = selectedMember ? 'PUT' : 'POST';
    const url = selectedMember
      ? `/api/family-members/${selectedMember.id}`
      : '/api/family-members';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${selectedMember ? 'update' : 'create'} family member`);
      }

      toast.success(`Family member ${selectedMember ? 'updated' : 'added'} successfully!`);
      setIsMemberDialogOpen(false);
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeleteMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsDeleteMemberDialogOpen(true);
  };

  const confirmDeleteMember = async () => {
    if (!selectedMember) return;
    try {
      const response = await fetch(`/api/family-members/${selectedMember.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete family member');
      }
      toast.success('Family member deleted successfully!');
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleteMemberDialogOpen(false);
      setSelectedMember(null);
    }
  };

  const handlePetFormSubmit = async (values: any) => {
    const method = selectedPet ? 'PUT' : 'POST';
    const url = selectedPet
      ? `/api/pets/${selectedPet.id}`
      : '/api/pets';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${selectedPet ? 'update' : 'create'} pet`);
      }

      toast.success(`Pet ${selectedPet ? 'updated' : 'added'} successfully!`);
      setIsPetDialogOpen(false);
      fetchAllData();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleDeletePet = (pet: Pet) => {
    setSelectedPet(pet);
    setIsDeletePetDialogOpen(true);
  };

  const confirmDeletePet = async () => {
    if (!selectedPet) return;
    try {
      const response = await fetch(`/api/pets/${selectedPet.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete pet');
      }
      toast.success('Pet deleted successfully!');
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeletePetDialogOpen(false);
      setSelectedPet(null);
    }
  };

  const handleLocationFormSubmit = async (values: any) => {
    if (!planId) return;
    const method = selectedLocation ? 'PUT' : 'POST';
    const url = selectedLocation
      ? `/api/plans/${planId}/locations/${selectedLocation.id}`
      : `/api/plans/${planId}/locations`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to save location`);
      }

      toast.success(`Location saved successfully!`);
      setIsLocationDialogOpen(false);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteLocation = (location: any) => {
    setSelectedLocation(location);
    setIsDeleteLocationDialogOpen(true);
  };

  const confirmDeleteLocation = async () => {
    if (!selectedLocation || !planId) return;
    try {
      const response = await fetch(`/api/plans/${planId}/locations/${selectedLocation.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete location');
      }
      toast.success('Location deleted successfully!');
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleteLocationDialogOpen(false);
      setSelectedLocation(null);
    }
  };

  const handleTogglePlanItem = async (itemId: string, inPlan: boolean) => {
    if (!planId) return;
    const method = inPlan ? 'DELETE' : 'POST';
    const url = `/api/plans/${planId}/inventory`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: itemId, quantity: 1 }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${inPlan ? 'remove' : 'add'} item`);
      }
      toast.success(`Item ${inPlan ? 'removed from' : 'added to'} plan!`);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleSaveContactChanges = async () => {
    if (!planId) return;
    try {
      const response = await fetch(`/api/plans/${planId}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactIds: planContacts }),
      });
      if (!response.ok) throw new Error('Failed to save contacts');
      toast.success('Communication plan saved successfully!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleContact = (contactId: string) => {
    setPlanContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSavePlan = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planName,
          description: description,
          hazard_type: hazardType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save plan")
      }

      const newPlan = await response.json()
      toast.success("Plan created successfully!")
      router.push(`/dashboard/plans/builder/${newPlan.id}`)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || "Failed to create plan.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePlan = async () => {
    if (!planId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planName,
          description: description,
          hazard_type: hazardType,
          is_active: isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update plan');
      }

      await response.json();
      toast.success('Plan updated successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to update plan.")
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (planId) {
      handleUpdatePlan();
    } else {
      handleSavePlan();
    }
  };

  const handleExportToPdf = () => {
    const input = reviewContentRef.current;
    if (input) {
      html2canvas(input)
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jspdf('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          const ratio = canvasWidth / canvasHeight;
          const width = pdfWidth;
          const height = width / ratio;
          pdf.addImage(imgData, 'PNG', 0, 0, width, height);
          pdf.save(`${planName || 'emergency-plan'}.pdf`);
        });
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="font-heading font-black text-3xl text-foreground">Emergency Plan Builder</h1>
                <p className="font-body text-muted-foreground mt-1">
                    {planId ? "Update your emergency plan." : "Create comprehensive emergency plans based on NOAA All-Hazards CONOPS"}
                </p>
            </div>
            <div className="flex space-x-2">
                <Button onClick={handleExportToPdf} variant="outline">Export to PDF</Button>
                <Button
                    className="font-body bg-gray-900 hover:bg-gray-800"
                    onClick={handleSubmit}
                    disabled={isLoading || !planName || !hazardType}
                >
                    {isLoading ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> {planId ? "Update Plan" : "Save Plan"}</>}
                </Button>
            </div>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{selectedMember ? 'Edit' : 'Add'} Family Member</DialogTitle>
                </DialogHeader>
                <FamilyMemberForm onFormSubmit={handleMemberFormSubmit} initialData={selectedMember} />
            </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteMemberDialogOpen} onOpenChange={setIsDeleteMemberDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {selectedMember?.first_name} {selectedMember?.last_name}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedMember(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteMember}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <Dialog open={isPetDialogOpen} onOpenChange={setIsPetDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{selectedPet ? 'Edit' : 'Add'} Pet</DialogTitle>
                </DialogHeader>
                <PetForm onFormSubmit={handlePetFormSubmit} initialData={selectedPet} />
            </DialogContent>
        </Dialog>
        <AlertDialog open={isDeletePetDialogOpen} onOpenChange={setIsDeletePetDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {selectedPet?.name}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedPet(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeletePet}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        {selectedMemberForMedicalNeeds && (
            <MedicalNeedsDialog
            familyMember={selectedMemberForMedicalNeeds}
            open={isMedicalNeedsDialogOpen}
            onOpenChange={setIsMedicalNeedsDialogOpen}
            />
        )}
        <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{selectedLocation ? 'Edit' : 'Add'} Location</DialogTitle>
                </DialogHeader>
                <PlanLocationForm onFormSubmit={handleLocationFormSubmit} initialData={selectedLocation} />
            </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteLocationDialogOpen} onOpenChange={setIsDeleteLocationDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the location: {selectedLocation?.name}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedLocation(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteLocation}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Card>
            <CardHeader>
            <CardTitle className="font-heading text-xl">Plan Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                <Label htmlFor="plan-name" className="font-body font-medium">
                    Plan Name
                </Label>
                <Input
                    id="plan-name"
                    placeholder="Enter plan name"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="font-body"
                    disabled={isLoading}
                />
                </div>
                <div className="space-y-2">
                <Label htmlFor="hazard-type" className="font-body font-medium">
                    Hazard Type
                </Label>
                <Select value={hazardType} onValueChange={setHazardType} disabled={isLoading}>
                    <SelectTrigger className="font-body">
                    <SelectValue placeholder="Select hazard type" />
                    </SelectTrigger>
                    <SelectContent>
                    {hazardTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                        {type}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="font-body font-medium">
                Plan Description
                </Label>
                <Textarea
                id="description"
                placeholder="Describe the purpose and scope of this emergency plan"
                className="font-body"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                />
            </div>
            </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="basic" className="font-body">Basic Info</TabsTrigger>
                <TabsTrigger value="locations" className="font-body">Locations</TabsTrigger>
                <TabsTrigger value="family" className="font-body">Family & Pets</TabsTrigger>
                <TabsTrigger value="inventory" className="font-body">Inventory</TabsTrigger>
                <TabsTrigger value="routes" className="font-body">Routes</TabsTrigger>
                <TabsTrigger value="contacts" className="font-body">Contacts</TabsTrigger>
                <TabsTrigger value="review" className="font-body">Review</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="font-heading text-lg flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                        Hazard Assessment
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-body font-medium">Risk Level</Label>
                        <Select>
                        <SelectTrigger className="font-body">
                            <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low Risk</SelectItem>
                            <SelectItem value="moderate">Moderate Risk</SelectItem>
                            <SelectItem value="high">High Risk</SelectItem>
                            <SelectItem value="extreme">Extreme Risk</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-body font-medium">Seasonal Considerations</Label>
                        <Textarea
                        placeholder="Describe seasonal factors that affect this hazard"
                        className="font-body"
                        rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-body font-medium">Warning Signs</Label>
                        <Textarea placeholder="List early warning signs and indicators" className="font-body" rows={3} />
                    </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-heading text-lg flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-primary" />
                        Key Locations
                    </CardTitle>
                    <Button size="sm" onClick={() => { setSelectedLocation(null); setIsLocationDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Location
                    </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {locations.map(location => (
                        <div key={location.id} className="border border-border rounded-lg p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-body font-semibold">{location.name} <Badge variant="outline">{location.type}</Badge></h3>
                                <p className="text-sm text-muted-foreground">{location.street_number} {location.street_name}, {location.city}, {location.state} {location.zip_code}</p>
                                <p className="text-sm text-muted-foreground mt-1">{location.notes}</p>
                            </div>
                            <div className="flex items-center space-x-0.5">
                                <Button variant="ghost" size="icon" onClick={() => { setSelectedLocation(location); setIsLocationDialogOpen(true); }}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteLocation(location)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="family" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="font-heading text-lg flex items-center">
                        <Users className="h-5 w-5 mr-2 text-primary" />
                        Family Members
                        </CardTitle>
                        <Button size="sm" onClick={() => { setSelectedMember(null); setIsMemberDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Member
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {familyMembers.map(member => (
                        <div key={member.id} className="border border-border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-body font-semibold">{member.first_name} {member.last_name}</h3>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                </div>
                                <div className="flex items-center space-x-0.5">
                                    <Button variant="ghost" size="icon" onClick={() => { setSelectedMember(member); setIsMemberDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteMember(member)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <Button variant="link" className="p-0 h-auto text-xs mt-2" onClick={() => { setSelectedMemberForMedicalNeeds(member); setIsMedicalNeedsDialogOpen(true); }}>
                                Manage Medical Needs
                            </Button>
                        </div>
                        ))}
                    </CardContent>
                    </Card>

                    <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="font-heading text-lg flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-destructive" />
                        Pets & Animals
                        </CardTitle>
                        <Button size="sm" onClick={() => { setSelectedPet(null); setIsPetDialogOpen(true); }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Pet
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pets.map(pet => (
                        <div key={pet.id} className="border border-border rounded-lg p-4 flex justify-between items-center">
                            <div>
                            <h3 className="font-body font-semibold">{pet.name}</h3>
                            <p className="text-sm text-muted-foreground">{pet.species} / {pet.breed}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedPet(pet); setIsPetDialogOpen(true); }}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeletePet(pet)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </div>
                        </div>
                        ))}
                    </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="font-heading text-lg flex items-center">
                        <Package className="h-5 w-5 mr-2 text-primary" />
                        Required Inventory Items
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                        <div className="text-sm font-body text-muted-foreground mb-4">
                            Based on your selected scenario (<b>{hazardType || "None"}</b>), here are the recommended items.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recommendedItems.map(recItem => {
                                const userItem = inventoryItems.find(item => item.name.toLowerCase() === recItem.toLowerCase());
                                const inPlan = userItem && planItems.some(pItem => pItem.item_id === userItem.id);

                                let statusBadge;
                                if (userItem) {
                                    statusBadge = inPlan
                                        ? <Badge variant="default">In Plan</Badge>
                                        : <Badge variant="secondary">In Stock</Badge>;
                                } else {
                                    statusBadge = <Badge variant="destructive">Not in Stock</Badge>;
                                }

                                return (
                                    <div key={recItem} className="border border-border rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-body font-semibold">{recItem}</h3>
                                            {statusBadge}
                                        </div>
                                        {userItem && (
                                            <Button size="sm" onClick={() => handleTogglePlanItem(userItem.id, inPlan)}>
                                                {inPlan ? "Remove" : "Add"}
                                            </Button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="routes" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-heading text-lg flex items-center">
                            <Route className="h-5 w-5 mr-2 text-primary" />
                            Evacuation Routes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">This feature is not yet implemented.</p>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="contacts" className="space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle className="font-heading text-lg flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-primary" />
                        Communication Plan
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div className="text-sm font-body text-muted-foreground mb-4">
                        Select the family members who will be key contacts for this plan.
                    </div>
                    <div className="space-y-2">
                        {familyMembers.map(member => (
                        <div key={member.id} className="flex items-center space-x-2">
                            <Checkbox
                            id={`contact-${member.id}`}
                            checked={planContacts.includes(member.id)}
                            onCheckedChange={() => handleToggleContact(member.id)}
                            />
                            <label
                            htmlFor={`contact-${member.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                            {member.first_name} {member.last_name} ({member.role})
                            </label>
                        </div>
                        ))}
                    </div>
                    <Button onClick={handleSaveContactChanges} className="mt-4">Save Communication Plan</Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="review" className="space-y-6">
                <div ref={reviewContentRef} className="p-8 bg-white text-black">
                    <h1 className="text-3xl font-bold mb-6 text-center">{planName}</h1>
                    <p className="mb-6 text-center text-lg">{description}</p>
                    <div className="text-center mb-8">
                        <Badge className="text-lg p-2">{hazardType}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Key Locations</h2>
                            {locations.map(loc => <div key={loc.id} className="mb-2"><strong>{loc.name} ({loc.type}):</strong> {loc.street_number} {loc.street_name}, {loc.city}</div>)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Communication Plan</h2>
                            {familyMembers.filter(fm => planContacts.includes(fm.id)).map(contact => <div key={contact.id} className="mb-2"><strong>{contact.first_name} {contact.last_name}:</strong> {contact.phone_number} / {contact.email}</div>)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Family Members</h2>
                            {familyMembers.map(fm => <div key={fm.id} className="mb-2">{fm.first_name} {fm.last_name} ({fm.role})</div>)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Pets</h2>
                            {pets.map(pet => <div key={pet.id} className="mb-2">{pet.name} ({pet.species} - {pet.breed})</div>)}
                        </div>
                    </div>

                    <h2 className="text-xl font-bold mt-8 mb-4 border-b pb-2">Inventory Checklist</h2>
                    <ul className="list-disc list-inside grid grid-cols-3 gap-x-8">
                        {recommendedItems.map(item => <li key={item}>{item}</li>)}
                    </ul>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  )
}
