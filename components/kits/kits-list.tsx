import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Edit, Trash2, Package, Car, Home, Building, Backpack, Shield, Wrench, Package2 } from "lucide-react"
import { getKits } from "@/lib/data/kits"
import { auth } from "@/lib/auth"
import { format } from 'date-fns'

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

export async function KitsList() {
  const session = await auth()
  if (!session?.user?.id) {
    return <div>Please log in to see your kits.</div>
  }

  const kits = await getKits(session.user.id)

  if (kits.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">No kits found.</h2>
        <p className="text-muted-foreground">Get started by creating a new kit.</p>
      </div>
    )
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

          return (
            <Card key={kit.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{kit.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {kit.category && (
                  <Badge variant="secondary">{kit.category}</Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
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
