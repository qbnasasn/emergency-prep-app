"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface Tip {
  id: string
  tip: string
  category: string
}

export function KnowledgeTips() {
  const [tips, setTips] = useState<Tip[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await fetch("/api/tips")
        if (!response.ok) {
          throw new Error("Failed to fetch tips")
        }
        const data = await response.json()
        setTips(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred")
        }
        console.error(err)
      }
    }

    fetchTips()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle className="font-heading text-lg">Knowledge Tips</CardTitle>
        </div>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && <p className="text-destructive-foreground bg-destructive p-2 rounded-md">{error}</p>}
          {!error && tips.length === 0 && <p>No tips available at the moment.</p>}
          {tips.map((tip) => (
            <div key={tip.id} className="border-l-4 border-primary pl-4">
              <h3 className="font-body font-semibold text-foreground text-sm">{tip.category}</h3>
              <p className="font-body text-sm text-muted-foreground mt-1">{tip.tip}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4 font-body bg-transparent">
          View All Tips
        </Button>
      </CardContent>
    </Card>
  )
}
