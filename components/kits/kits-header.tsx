import { Button } from "@/components/ui/button"
import { Plus, MapPin } from "lucide-react"
import Link from "next/link"

export function KitsHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-sans">Emergency Kits</h1>
        <p className="text-muted-foreground">Build and manage your emergency preparedness kits with GPS tracking</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <MapPin className="h-4 w-4 mr-2" />
          View on Map
        </Button>
        <Link href="/dashboard/kits/builder">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Kit
          </Button>
        </Link>
      </div>
    </div>
  )
}
