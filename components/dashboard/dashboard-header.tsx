"use client"

import { Bell, Settings, User, LogOut, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { ModeToggle } from "@/components/ui/mode-toggle"

export function DashboardHeader() {
  const { data: session } = useSession()
  const user = session?.user
  const initials = user?.name?.split(' ').map(n => n[0]).join('') ?? ''

  return (
    <header className="border-b border-border px-6 py-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src="/images/LOGO.png" alt="PreSafe" width={150} height={190} className="h-12 w-auto" />
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">PreSafe</h1>
            <p className="font-body text-sm text-muted-foreground">Emergency Preparedness Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? 'User'} />
                  <AvatarFallback className="bg-muted">
                    {initials || <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-body">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="font-body cursor-pointer">
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="font-body cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                Request Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="font-body cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
