"use client"

import { SessionProvider } from "next-auth/react"
import { Toaster } from "sonner"

export default function Provider({
  children,
  session,
}: {
  children: React.ReactNode
  session?: any
}) {
  return (
    <SessionProvider session={session}>
      {children}
      <Toaster position="bottom-right" />
    </SessionProvider>
  )
}
