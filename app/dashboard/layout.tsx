"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { OfflineGate } from "@/components/auth/offline-gate"
import { SyncManager } from "@/components/sync/sync-manager"
import { BrowserWarning } from "@/components/utility/browser-warning"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <OfflineGate>
        <SyncManager />
        <BrowserWarning />
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          <div className="flex">
            <DashboardNav />
            <main className="flex-1 p-6">
              <div className="max-w-7xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </OfflineGate>
    </ThemeProvider>
  )
}
