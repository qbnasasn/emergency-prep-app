import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, ExternalLink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getRandomTip } from "@/lib/actions/knowledge"

export async function KnowledgeTips() {
  const tip = await getRandomTip()

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <CardTitle className="font-heading text-lg">Daily Knowledge Tip</CardTitle>
        </div>
        <Link href="/dashboard/knowledge">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink className="h-4 w-4" />
                <span className="sr-only">Go to Knowledge Base</span>
            </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        {tip ? (
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 pl-4 py-1 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-r-md">
                <h3 className="font-heading font-semibold text-foreground text-sm uppercase tracking-wide text-yellow-700 dark:text-yellow-500 mb-1">
                    {tip.category || "General Tip"}
                </h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    {tip.content}
                </p>
              </div>
            </div>
        ) : (
            <div className="text-center py-6 text-muted-foreground">
                <p>No tips available yet.</p>
                <p className="text-xs mt-1">Check back later or add your own!</p>
            </div>
        )}

        <div className="mt-6 pt-4 border-t">
            <Link href="/dashboard/knowledge" className="w-full block">
                <Button variant="outline" className="w-full justify-between group">
                  Browse Knowledge Base
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </Link>
        </div>
      </CardContent>
    </Card>
  )
}
