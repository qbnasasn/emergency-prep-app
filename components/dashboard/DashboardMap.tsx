'use client'

import { useState, useEffect } from "react"
import Map, { Location } from "@/components/maps/Map"
import { Button } from "@/components/ui/button"
import { Layers, Route as RouteIcon } from "lucide-react"
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
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>(undefined);
  const [showWeather, setShowWeather] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [locationsRes, routesRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/routes')
        ]);

        if (!locationsRes.ok) {
          throw new Error('Failed to fetch locations');
        }
        if (!routesRes.ok) {
          throw new Error('Failed to fetch routes');
        }

        const userLocations = await locationsRes.json();
        const userRoutess = await routesRes.json();

        setLocations(userLocations);
        setRoutes(userRoutess);
        if (userRoutess.length > 0) {
          setSelectedRoute(userRoutess[0]);
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
      <Map locations={locations} waypoints={selectedRoute?.waypoints} showWeather={showWeather} />
      <div className="absolute top-4 right-4 flex space-x-2">
        {routes.length > 0 && (
          <Select onValueChange={handleRouteChange} defaultValue={selectedRoute?.id}>
            <SelectTrigger className="w-[180px]">
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
        <Button variant="ghost" size="sm" onClick={() => setShowWeather(!showWeather)}>
          <Layers className="h-4 w-4 mr-2" />
          {showWeather ? "Hide" : "Show"} Weather
        </Button>
      </div>
    </div>
  );
}