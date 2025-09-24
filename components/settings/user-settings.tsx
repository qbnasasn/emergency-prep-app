"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, MapPin, Save, Plus, Trash2, Loader2 } from "lucide-react"
import { FamilyMembers } from "./family-members"
import { Pets } from "./pets"
import AddressAutocomplete, { StructuredAddress } from "../ui/address-autocomplete"
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid';
import { Input } from "../ui/input"

interface NoaaLocation extends StructuredAddress {
  id: string; // Client-side unique ID
  name: string; // User-defined name for the location
  full_address: string;
}

export function UserSettings() {
  const [locations, setLocations] = useState<NoaaLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user/settings');
        if (response.ok) {
          const data = await response.json();
          if (data && data.noaa_alert_locations) {
            const locationsWithIds = data.noaa_alert_locations.map((loc: any) => ({ ...loc, id: loc.id || uuidv4() }));
            setLocations(locationsWithIds);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
        toast.error("Could not load your settings.");
      } finally {
        setIsFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleLocationUpdate = (index: number, newAddress: StructuredAddress, newFullAddress: string) => {
    const newLocations = [...locations];
    const oldLocation = newLocations[index];
    newLocations[index] = { ...oldLocation, ...newAddress, full_address: newFullAddress };
    setLocations(newLocations);
  };

  const handleLocationNameChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newLocations = [...locations];
    newLocations[index].name = e.target.value;
    setLocations(newLocations);
  };

  const handleFullAddressChange = (value: string, index: number) => {
    const newLocations = [...locations];
    newLocations[index].full_address = value;
    setLocations(newLocations);
  };

  const addLocation = () => {
    setLocations([
      ...locations,
      {
        id: uuidv4(),
        name: `Location ${locations.length + 1}`,
        full_address: '',
        street_number: '',
        street_name: '',
        city: '',
        state: '',
        zip_code: '',
        latitude: null,
        longitude: null,
      }
    ]);
  };

  const removeLocation = (index: number) => {
    const newLocations = locations.filter((_, i) => i !== index);
    setLocations(newLocations);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // We only need to store a subset of the fields in the DB
      const locationsToSave = locations.map(({ id, ...rest }) => rest);

      const response = await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noaa_alert_locations: locationsToSave }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save settings.");
      }

      toast.success("Settings saved successfully!");
      const savedData = await response.json();
      if (savedData && savedData.noaa_alert_locations) {
        const locationsWithIds = savedData.noaa_alert_locations.map((loc: any) => ({ ...loc, id: loc.id || uuidv4() }));
        setLocations(locationsWithIds);
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            <Button variant="outline" size="sm" onClick={addLocation} className="font-body bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>

          {isFetching ? <Loader2 className="animate-spin" /> : (
            <div className="space-y-4">
              {locations.map((location, index) => (
                <div key={location.id} className="p-4 border rounded-lg space-y-3 bg-muted/20">
                    <div className="flex justify-between items-center">
                        <Input
                            value={location.name}
                            onChange={(e) => handleLocationNameChange(e, index)}
                            placeholder="Location Name (e.g. Home)"
                            className="text-sm font-medium border-none p-0 bg-transparent focus:ring-0"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeLocation(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                  <AddressAutocomplete
                    value={location.full_address}
                    onChange={(value) => handleFullAddressChange(value, index)}
                    onAddressSelect={(address) => handleLocationUpdate(index, address, location.full_address)}
                  />
                </div>
              ))}
              {locations.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No alert locations added.</p>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Subscription Section remains unchanged */}
        </div>

        <Button onClick={handleSaveSettings} disabled={isLoading || isFetching} className="w-full font-body bg-gray-900 hover:bg-gray-800">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Settings
        </Button>
      </CardContent>
    </Card>
  )
}
