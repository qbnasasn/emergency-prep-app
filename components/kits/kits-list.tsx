"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Package, Car, Home, Building, Backpack, Shield, Wrench, Package2, Loader2 } from "lucide-react"
import { Kit } from "@/lib/data/kits"
import { format } from 'date-fns'
import { KitCardActions } from "./kit-card-actions"
import { cn } from "@/lib/utils"

const kitIconMap: { [key: string]: React.ElementType } = {
  "Go-Bag (Bug-Out Bag) 72-hours": Backpack,
  "Stay-at-Home Kit (Shelter-in-Place Kit)": Home,
  "First-Aid Kit": Package,
  "Emergency Car Kit": Car,
  "Work Emergency Kit": Building,
  "Resupply Cache": Wrench,
  "Communications Kit": Shield,
  "Custom Kit": Package2,
  "default": Package,
};

interface KitsListProps {
  kits: Kit[];
  isLoading: boolean;
  onEditKit: (kit: Kit) => void;
  onDataChange: () => void;
}

export function KitsList({ kits, isLoading, onEditKit, onDataChange }: KitsListProps) {
  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (kits.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">No kits found.</h2>
        <p className="text-muted-foreground">Get started by creating a new kit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Emergency Kits</h2>
        <Button variant="outline" size="sm">
          <Package className="h-4 w-4 mr-2" />
          Kit Templates
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kits.map((kit) => {
          const Icon = kit.category ? kitIconMap[kit.category] || kitIconMap.default : kitIconMap.default
          const gpsDisplay = kit.gps_location ? `${kit.gps_location.x.toFixed(4)}, ${kit.gps_location.y.toFixed(4)}` : "Not set"

          const getCategoryColor = (category: string) => {
            const colors = [
              "bg-blue-100 text-blue-800", "bg-orange-100 text-orange-800", "bg-red-100 text-red-800",
              "bg-purple-100 text-purple-800", "bg-green-100 text-green-800", "bg-yellow-100 text-yellow-800",
              "bg-indigo-100 text-indigo-800", "bg-pink-100 text-pink-800",
            ];
            const hash = category.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return colors[hash % colors.length];
          };

          return (
            <Card key={kit.id} className="hover:shadow-md transition-shadow flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{kit.name}</CardTitle>
                  </div>
                  <KitCardActions kit={kit} onEditKit={onEditKit} onDataChange={onDataChange} />
                </div>
                {kit.category && (
                  <Badge className={cn("mt-1", getCategoryColor(kit.category))}>{kit.category}</Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {kit.description || 'No description'}
                  </div>
                  <div className="text-xs text-muted-foreground">GPS: {gpsDisplay}</div>
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{kit.item_count || 0} items</span>
                  <span>Created {format(new Date(kit.created_at), 'PPP')}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Package className="h-4 w-4 mr-2" />
                    View Items
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
