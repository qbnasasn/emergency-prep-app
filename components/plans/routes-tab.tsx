"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, PlusCircle, ArrowUp, ArrowDown, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Location } from './plan-builder';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Route {
  id: string;
  name: string;
  waypoints: string[]; // Array of location IDs
}

interface RoutesTabProps {
  planId: string | undefined;
  routes: Route[];
  onRoutesChange: (routes: Route[]) => void;
  locations: Location[];
}

export function RoutesTab({ planId, routes, onRoutesChange, locations }: RoutesTabProps) {
  const handleAddRoute = () => {
    const newRoute: Route = {
      id: uuidv4(), // Temporary client-side ID
      name: 'New Route',
      waypoints: [],
    };
    onRoutesChange([...routes, newRoute]);
  };

  const handleDeleteRoute = (routeId: string) => {
    onRoutesChange(routes.filter(route => route.id !== routeId));
  };

  const handleRouteNameChange = (routeId: string, newName: string) => {
    onRoutesChange(
      routes.map(route =>
        route.id === routeId ? { ...route, name: newName } : route
      )
    );
  };

  const handleAddWaypoint = (routeId: string, locationId: string) => {
    if (!locationId) return;
    onRoutesChange(
      routes.map(route => {
        if (route.id === routeId) {
          // Avoid adding duplicate waypoints
          if (route.waypoints.includes(locationId)) return route;
          return { ...route, waypoints: [...route.waypoints, locationId] };
        }
        return route;
      })
    );
  };

  const handleRemoveWaypoint = (routeId: string, waypointIndex: number) => {
    onRoutesChange(
      routes.map(route => {
        if (route.id === routeId) {
          const newWaypoints = [...route.waypoints];
          newWaypoints.splice(waypointIndex, 1);
          return { ...route, waypoints: newWaypoints };
        }
        return route;
      })
    );
  };

  const handleMoveWaypoint = (routeId: string, index: number, direction: 'up' | 'down') => {
    onRoutesChange(
      routes.map(route => {
        if (route.id === routeId) {
          const newWaypoints = [...route.waypoints];
          const [movedItem] = newWaypoints.splice(index, 1);
          const newIndex = direction === 'up' ? index - 1 : index + 1;
          newWaypoints.splice(newIndex, 0, movedItem);
          return { ...route, waypoints: newWaypoints };
        }
        return route;
      })
    );
  };

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Unknown Location';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Evacuation Routes</CardTitle>
        <Button size="sm" variant="outline" onClick={handleAddRoute}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Route
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {routes.length === 0 && (
          <p className="text-center text-muted-foreground p-4">No routes defined. Add one to get started.</p>
        )}
        {routes.map(route => (
          <Card key={route.id} className="bg-muted/30">
<CardHeader className="flex flex-row items-center justify-between py-3">
                <Input
                  value={route.name}
                  onChange={e => handleRouteNameChange(route.id, e.target.value)}
                  placeholder="Enter route name"
                  className="font-semibold text-lg flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button variant="ghost" size="icon" onClick={() => handleDeleteRoute(route.id)}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {route.waypoints.map((waypointId, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-background">
                    <p className="font-medium">{index + 1}. {getLocationName(waypointId)}</p>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => handleMoveWaypoint(route.id, index, 'up')}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled={index === route.waypoints.length - 1} onClick={() => handleMoveWaypoint(route.id, index, 'down')}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveWaypoint(route.id, index)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                 {route.waypoints.length < 2 && (
                    <p className="text-xs text-muted-foreground text-center">A route needs at least two locations (a start and an end).</p>
                )}
              </div>
              <div className="mt-4">
                <Select onValueChange={(value) => handleAddWaypoint(route.id, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add a location to this route..." />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.filter(loc => !route.waypoints.includes(loc.id)).map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                    {locations.filter(loc => !route.waypoints.includes(loc.id)).length === 0 && (
                        <p className="p-2 text-sm text-muted-foreground">All available locations have been added.</p>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
