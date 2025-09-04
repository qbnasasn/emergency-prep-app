import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Edit, Trash2, Package, Car, Home, Building, Backpack, Shield, Wrench } from "lucide-react"

const kitTypes = {
  basic: { icon: Package, label: "Basic/72-Hour Kit", color: "bg-blue-100 text-blue-800" },
  extended: { icon: Package, label: "Extended Kit", color: "bg-purple-100 text-purple-800" },
  vehicle: { icon: Car, label: "Vehicle Emergency Kit", color: "bg-orange-100 text-orange-800" },
  shelter: { icon: Home, label: "Shelter-in-Place Kit", color: "bg-green-100 text-green-800" },
  office: { icon: Building, label: "Office Emergency Kit", color: "bg-muted text-foreground" },
  evacuation: { icon: Backpack, label: "Evacuation/Go Bag", color: "bg-red-100 text-red-800" },
  tactical: { icon: Shield, label: "Tactical Vest", color: "bg-black text-white" },
  specialized: { icon: Wrench, label: "Specialized Kit", color: "bg-yellow-100 text-yellow-800" },
}

export function KitsList() {
  const kits = [
    {
      id: 1,
      name: "Home 72-Hour Kit",
      type: "basic",
      location: "Main Bedroom Closet",
      gpsCoords: "40.7128, -74.0060",
      completeness: 85,
      itemCount: 34,
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      name: "Car Emergency Kit",
      type: "vehicle",
      location: "Toyota Camry Trunk",
      gpsCoords: "40.7589, -73.9851",
      completeness: 92,
      itemCount: 28,
      lastUpdated: "2024-01-10",
    },
    {
      id: 3,
      name: "Office Go Bag",
      type: "office",
      location: "Desk Drawer 3",
      gpsCoords: "40.7505, -73.9934",
      completeness: 67,
      itemCount: 19,
      lastUpdated: "2024-01-08",
    },
    {
      id: 4,
      name: "Evacuation Backpack",
      type: "evacuation",
      location: "Hall Closet",
      gpsCoords: "40.7128, -74.0060",
      completeness: 78,
      itemCount: 42,
      lastUpdated: "2024-01-12",
    },
  ]

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
          const kitType = kitTypes[kit.type as keyof typeof kitTypes]
          const Icon = kitType.icon

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
                <Badge className={kitType.color} variant="secondary">
                  {kitType.label}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {kit.location}
                  </div>
                  <div className="text-xs text-muted-foreground">GPS: {kit.gpsCoords}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completeness</span>
                    <span className="font-medium">{kit.completeness}%</span>
                  </div>
                  <Progress value={kit.completeness} className="h-2" />
                </div>

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{kit.itemCount} items</span>
                  <span>Updated {kit.lastUpdated}</span>
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
