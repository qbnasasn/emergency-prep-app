"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Home,
  Package,
  FileText,
  Briefcase,
  ShoppingCart,
  Radio,
  UtensilsCrossed,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  { name: "Emergency Plans", href: "/dashboard/plans", icon: FileText },
  { name: "Emergency Kits", href: "/dashboard/kits", icon: Briefcase },
  { name: "Shopping List", href: "/dashboard/shopping", icon: ShoppingCart },
  { name: "Communications", href: "/dashboard/communications", icon: Radio },
  { name: "Food Planning", href: "/dashboard/food", icon: UtensilsCrossed },
  { name: "Knowledge Base", href: "/dashboard/knowledge", icon: BookOpen },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardNav() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <nav className={cn("border-r border-border transition-all duration-300 bg-card", collapsed ? "w-16" : "w-64")}>
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full justify-end mb-4">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-body rounded-lg transition-colors",
                    isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-gray-50 hover:text-foreground",
                  )}
                >
                  <item.icon className={cn("flex-shrink-0 h-5 w-5", collapsed ? "mr-0" : "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
