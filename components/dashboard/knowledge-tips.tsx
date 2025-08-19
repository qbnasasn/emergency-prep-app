import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

const tips = [
  {
    title: "Water Storage Basics",
    description: "Store 1 gallon per person per day for at least 3 days.",
    category: "Essential Supplies",
  },
  {
    title: "Emergency Communication",
    description: "Keep a battery-powered or hand-crank radio for emergency updates.",
    category: "Communications",
  },
  {
    title: "Food Safety During Outages",
    description: "Keep refrigerator and freezer doors closed to maintain temperature.",
    category: "Food Planning",
  },
]

export function KnowledgeTips() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <CardTitle className="font-heading text-lg">Knowledge Tips</CardTitle>
        </div>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-body font-semibold text-gray-900 text-sm">{tip.title}</h3>
              <p className="font-body text-sm text-gray-600 mt-1">{tip.description}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-body">
                {tip.category}
              </span>
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
