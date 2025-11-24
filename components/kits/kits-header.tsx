import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { useState } from "react"

interface KitsHeaderProps {
  onNewKit: () => void;
  onSearch: (query: string) => void;
}

export function KitsHeader({ onNewKit, onSearch }: KitsHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-heading">Emergency Kits</h1>
        <p className="text-muted-foreground">Build and manage your emergency preparedness kits with GPS tracking</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search kits..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-64 font-body"
          />
        </div>
        <Button size="sm" onClick={onNewKit}>
          <Plus className="h-4 w-4 mr-2" />
          New Kit
        </Button>
      </div>
    </div>
  )
}
