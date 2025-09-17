'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Trash2, Edit, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LocationForm } from './location-form'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from 'sonner'

export function LocationsTab({ planId, locations, fetchLocations }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleAdd = () => {
    setSelectedLocation(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (location) => {
    setSelectedLocation(location)
    setIsDialogOpen(true)
  }

  const handleDelete = (location) => {
    setSelectedLocation(location)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedLocation) return;
    try {
        const response = await fetch(`/api/plans/${planId}/locations/${selectedLocation.id}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error("Failed to delete location.");
        }
        toast.success("Location deleted successfully.");
        setIsDeleteDialogOpen(false);
        setSelectedLocation(null);
        fetchLocations();
    } catch(err: any) {
        toast.error(err.message);
    }
  };

  const handleFormSubmit = async (values) => {
    const method = selectedLocation ? 'PUT' : 'POST'
    const url = selectedLocation
      ? `/api/plans/${planId}/locations/${selectedLocation.id}`
      : `/api/plans/${planId}/locations`

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        })

        if (!response.ok) {
            throw new Error(`Failed to ${selectedLocation ? 'update' : 'create'} location.`);
        }
        toast.success(`Location ${selectedLocation ? 'updated' : 'created'} successfully.`);
        setIsDialogOpen(false)
        fetchLocations()
    } catch(err: any) {
        toast.error(err.message);
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Manage Plan Locations</h3>
        <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Location
        </Button>
      </div>
      <div className="space-y-4">
        {locations.length === 0 ? (
            <p className="text-muted-foreground text-center p-4">No locations have been added to this plan yet.</p>
        ) : (
            locations.map((location) => (
              <div key={location.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 mt-1 text-primary" />
                    <div>
                      <p className="font-semibold">{location.name} <span className="text-sm font-normal text-muted-foreground">({location.type})</span></p>
                      <p className="text-sm text-muted-foreground">
                        {location.street_number} {location.street_name}, {location.city}, {location.state} {location.zip_code}
                      </p>
                      {location.notes && <p className="text-xs text-gray-500 mt-1">Notes: {location.notes}</p>}
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(location)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(location)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedLocation ? 'Edit' : 'Add'} Location</DialogTitle>
          </DialogHeader>
          <LocationForm onFormSubmit={handleFormSubmit} initialData={selectedLocation} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the location "{selectedLocation?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedLocation(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
