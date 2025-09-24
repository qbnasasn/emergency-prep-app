"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, MapPin, Save, Plus, Trash2, Loader2, Edit } from "lucide-react"
import { FamilyMembers } from "./family-members"
import { Pets } from "./pets"
import AddressAutocomplete, { StructuredAddress } from "../ui/address-autocomplete"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "../ui/input"
import { useForm, Controller } from "react-hook-form"
import { useCallback } from "react"

interface NoaaLocation {
  id: string;
  name: string;
  full_address: string;
  street_number: string;
  street_name: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
}

function LocationDialog({ isOpen, onClose, onSave, location }) {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    defaultValues: location || { name: '', full_address: '' }
  });

  const handleAddressSelect = useCallback((address: StructuredAddress, fullAddress: string) => {
    setValue('full_address', fullAddress, { shouldValidate: true });
    setValue('street_number', address.street_number, { shouldValidate: true });
    setValue('street_name', address.street_name, { shouldValidate: true });
    setValue('city', address.city, { shouldValidate: true });
    setValue('state', address.state, { shouldValidate: true });
    setValue('zip_code', address.zip_code, { shouldValidate: true });
    setValue('latitude', address.latitude, { shouldValidate: true });
    setValue('longitude', address.longitude, { shouldValidate: true });
  }, [setValue]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{location ? 'Edit' : 'Add'} NOAA Alert Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <Input {...register('name', { required: 'Location name is required' })} placeholder="Location Name (e.g. Home)" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}

            <Controller
              name="full_address"
              control={control}
              render={({ field }) => (
                <AddressAutocomplete
                  value={field.value}
                  onChange={field.onChange}
                  onAddressSelect={handleAddressSelect}
                />
              )}
            />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export function UserSettings() {
  const [locations, setLocations] = useState<NoaaLocation[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<NoaaLocation | null>(null);

  const fetchLocations = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/noaa-locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error("Failed to fetch NOAA locations:", error);
      toast.error("Could not load your alert locations.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSave = async (data: any) => {
    const method = selectedLocation ? 'PUT' : 'POST';
    const url = selectedLocation ? `/api/noaa-locations/${selectedLocation.id}` : '/api/noaa-locations';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${selectedLocation ? 'update' : 'create'} location.`);
      }
      toast.success(`Location ${selectedLocation ? 'updated' : 'created'} successfully.`);
      fetchLocations(); // Refresh the list
      setIsDialogOpen(false);
      setSelectedLocation(null);

    } catch(err: any) {
      toast.error(err.message);
    }
  }

  const handleDelete = async (locationId: string) => {
    try {
        const response = await fetch(`/api/noaa-locations/${locationId}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error("Failed to delete location.");
        }
        toast.success("Location deleted successfully.");
        fetchLocations();
    } catch(err: any) {
        toast.error(err.message);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FamilyMembers />
          <Pets />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-body font-semibold text-foreground flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                NOAA Alert Locations
              </h3>
              <Button variant="outline" size="sm" onClick={() => { setSelectedLocation(null); setIsDialogOpen(true); }} className="font-body bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>

            {isFetching ? <Loader2 className="animate-spin mx-auto" /> : (
              <div className="space-y-2">
                {locations.map((location) => (
                  <div key={location.id} className="p-3 border rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-muted-foreground">{location.full_address}</p>
                    </div>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedLocation(location); setIsDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(location.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                ))}
                {locations.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No alert locations added.</p>}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Subscription Section remains unchanged */}
          </div>
        </CardContent>
      </Card>

      {isDialogOpen && (
          <LocationDialog
            isOpen={isDialogOpen}
            onClose={() => { setIsDialogOpen(false); setSelectedLocation(null); }}
            onSave={handleSave}
            location={selectedLocation}
          />
      )}
    </>
  )
}