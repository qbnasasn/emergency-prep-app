'use client'

import { useState, useEffect } from "react"
import Map, { Location, Kit } from "@/components/maps/Map"
import { Route as RouteIcon, Backpack } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Route {
  id: string;
  name: string;
  waypoints: Location[];
}

export function DashboardMap() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>(undefined);
  const [selectedKitId, setSelectedKitId] = useState<string>("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const [locationsRes, routesRes, kitsRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/routes'),
          fetch('/api/kits')
        ]);

        if (!locationsRes.ok) throw new Error('Failed to fetch locations');
        if (!routesRes.ok) throw new Error('Failed to fetch routes');
        if (!kitsRes.ok) throw new Error('Failed to fetch kits');

        const userLocations = await locationsRes.json();
        const userRoutes = await routesRes.json();
        const userKits = await kitsRes.json();

        setLocations(userLocations);
        setRoutes(userRoutes);
        setKits(userKits);
        if (userRoutes.length > 0) {
          setSelectedRoute(userRoutes[0]);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchData();
  }, []);

  const handleRouteChange = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    setSelectedRoute(route);
  };

  return (
    <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
      <Map
        locations={locations}
        waypoints={selectedRoute?.waypoints}
        kits={selectedKitId === 'all' ? kits : kits.filter(k => k.id === selectedKitId)}
      />
      <div className="absolute top-4 right-4 flex space-x-2">
        {kits.length > 0 && (
          <Select onValueChange={setSelectedKitId} defaultValue="all">
            <SelectTrigger className="w-[180px] bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Backpack className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select a kit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Kits</SelectItem>
              {kits.map(kit => (
                <SelectItem key={kit.id} value={kit.id}>
                  {kit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {routes.length > 0 && (
          <Select onValueChange={handleRouteChange} defaultValue={selectedRoute?.id}>
            <SelectTrigger className="w-[180px] bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <RouteIcon className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select a route" />
            </SelectTrigger>
            <SelectContent>
              {routes.map(route => (
                <SelectItem key={route.id} value={route.id}>
                  {route.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
