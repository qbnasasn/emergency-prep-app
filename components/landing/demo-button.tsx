"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function DemoButton() {
  return (
    <Button
      variant="outline"
      size="lg"
      className="text-white border-slate-600 hover:bg-white/10 h-12 px-8 bg-transparent rounded-full"
      onClick={() => toast.info("Coming soon")}
    >
      View Demo
    </Button>
  )
}
