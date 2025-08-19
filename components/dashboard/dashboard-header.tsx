"use client"

import { Bell, Settings, User, LogOut, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

export function DashboardHeader() {
  return (
    <header className="border-b border-gray-200 px-6 py-4 bg-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src="/images/safeprep-logo.png" alt="SafePrep" width={40} height={40} className="w-10 h-10" />
          <div>
            <h1 className="font-heading font-bold text-xl text-gray-900">SafePrep</h1>
            <p className="font-body text-sm text-gray-500">Emergency Preparedness Platform</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                  <AvatarFallback className="bg-gray-200">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="font-body">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="font-body">
                <HelpCircle className="mr-2 h-4 w-4" />
                Request Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-body">
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
