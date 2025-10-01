import { Button } from "@/components/ui/button"
import { Plus, MapPin } from "lucide-react"

interface KitsHeaderProps {
  onNewKit: () => void;
}

export function KitsHeader({ onNewKit }: KitsHeaderProps) {
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
        <Button size="sm" onClick={onNewKit}>
          <Plus className="h-4 w-4 mr-2" />
          New Kit
        </Button>
      </div>
    </div>
  )
}
