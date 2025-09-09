"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, MapPin, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { PlanLocationForm } from "./plan-location-form"
import { Badge } from "@/components/ui/badge"

interface PlanBuilderProps {
  planId?: string;
}

export function PlanBuilder({ planId }: PlanBuilderProps) {
  const [locations, setLocations] = useState<any[]>([]);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isDeleteLocationDialogOpen, setIsDeleteLocationDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);

  const fetchLocations = async () => {
    if (!planId) return;
    try {
      const response = await fetch(`/api/plans/${planId}/locations`);
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchLocations();
    }
  }, [planId]);

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
      fetchLocations();
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
      fetchLocations();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleteLocationDialogOpen(false);
      setSelectedLocation(null);
    }
  };

  return (
    <div className="space-y-6">
        <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{selectedLocation ? 'Edit' : 'Add'} Location</DialogTitle>
                    <DialogDescription>
                        Add or edit a key location for your emergency plan.
                    </DialogDescription>
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

        <Tabs defaultValue="locations" className="space-y-6">
            <TabsList>
                <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>
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
        </Tabs>
    </div>
  )
}
