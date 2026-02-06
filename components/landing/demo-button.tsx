"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"

interface DemoButtonProps {
  href?: string
}

export function DemoButton({ href }: DemoButtonProps) {
  if (href) {
    return (
      <Button
        asChild
        variant="outline"
        size="lg"
        className="text-white border-slate-600 hover:bg-white/10 h-12 px-8 bg-transparent rounded-full"
      >
        <Link href={href} target="_blank" rel="noopener noreferrer">
          View Demo
        </Link>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="text-white border-slate-600 hover:bg-white/10 h-12 px-8 bg-transparent rounded-full"
      onClick={() => toast.info("Coming soon", {
        description: "The interactive demo is currently under development."
      })}
    >
      View Demo
    </Button>
  )
}
