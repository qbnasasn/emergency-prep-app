"use client"

import { Bell, Check, Trash2, HelpCircle, Menu, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SupportDialog } from "@/components/support/support-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import Image from "next/image"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useAuthUser } from "@/components/auth/auth-provider"
import { navigation } from "@/components/dashboard/dashboard-nav"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface Notification {
  id: string
  title: string
  message: string
  created_at: string
  read: boolean
  type: string
}

interface NotificationResponse {
  notifications: Notification[]
  unreadCount: number
}

export function DashboardHeader() {
  const { user, isSignedIn, signOut } = useAuthUser()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data: NotificationResponse = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error)
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      fetchNotifications()
      // Poll every minute
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    }
  }, [isSignedIn])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification read", error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' })
      // Decrement unread count if the deleted item was unread
      const notif = notifications.find(n => n.id === id)
      if (notif && !notif.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error("Failed to delete notification", error)
    }
  }

  return (
    <header className="border-b border-border px-6 py-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex items-center gap-2 px-2">
                  <Image src="/images/LOGO.png" alt="PrepSafe" width={40} height={40} className="h-8 w-auto" />
                  <span className="font-heading font-bold text-lg">PrepSafe</span>
                </div>
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-body rounded-lg transition-colors",
                          isActive
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-gray-50 hover:text-foreground dark:hover:text-gray-900"
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Image src="/images/LOGO.png" alt="PrepSafe" width={150} height={190} className="hidden md:block h-12 w-auto" />
          <div className="hidden md:block">
            <h1 className="font-heading font-bold text-xl text-foreground">PrepSafe</h1>
            <p className="font-body text-sm text-muted-foreground">Emergency Preparedness Platform</p>
          </div>
          {/* Mobile Logo (simplified) */}
          <div className="md:hidden">
             <h1 className="font-heading font-bold text-lg text-foreground">PrepSafe</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />

          <SupportDialog
            trigger={
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-5 w-5" />
              </Button>
            }
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel className="font-body flex justify-between items-center">
                <span>Notifications</span>
                {unreadCount > 0 && <span className="text-xs font-normal text-muted-foreground">{unreadCount} unread</span>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors relative group",
                        !notification.read && "bg-muted/20"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-none mb-1">{notification.title}</p>
                          <p className="text-xs text-muted-foreground">{notification.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault()
                                  markAsRead(notification.id)
                                }}
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.preventDefault()
                                  deleteNotification(notification.id)
                                }}
                                title="Remove"
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                            {!notification.read && <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0 ml-1" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account menu">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName || "Account"}
                  </p>
                  {user?.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
