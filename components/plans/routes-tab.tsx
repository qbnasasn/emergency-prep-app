"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export interface Route {
  id: string;
  name: string;
  start_location: string;
  end_location: string;
  waypoints: any[];
}

interface RoutesTabProps {
  planId: string | undefined;
  routes: Route[];
  onRoutesChange: (routes: Route[]) => void;
}

export function RoutesTab({ planId, routes, onRoutesChange }: RoutesTabProps) {
  const handleAddRoute = () => {
    const newRoute: Route = {
      id: uuidv4(), // Temporary client-side ID
      name: 'New Route',
      start_location: '',
      end_location: '',
      waypoints: [],
    };
    onRoutesChange([...routes, newRoute]);
  };

  const handleDeleteRoute = (routeId: string) => {
    onRoutesChange(routes.filter(route => route.id !== routeId));
  };

  const handleInputChange = (routeId: string, field: keyof Route, value: string) => {
    onRoutesChange(
      routes.map(route =>
        route.id === routeId ? { ...route, [field]: value } : route
      )
    );
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
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Route Name</TableHead>
                <TableHead className="w-[30%]">Start Location</TableHead>
                <TableHead className="w-[30%]">End Location</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.length > 0 ? (
                routes.map(route => (
                  <TableRow key={route.id}>
                    <TableCell>
                      <Input
                        value={route.name}
                        onChange={e => handleInputChange(route.id, 'name', e.target.value)}
                        placeholder="e.g., Primary Evac Route"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={route.start_location}
                        onChange={e =>
                          handleInputChange(route.id, 'start_location', e.target.value)
                        }
                        placeholder="e.g., Home"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={route.end_location}
                        onChange={e =>
                          handleInputChange(route.id, 'end_location', e.target.value)
                        }
                        placeholder="e.g., Rally Point"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRoute(route.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No routes defined for this plan. Click "Add Route" to begin.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
