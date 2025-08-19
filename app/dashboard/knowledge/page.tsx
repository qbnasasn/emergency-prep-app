import { Search, BookOpen, AlertTriangle, Users, Home, Zap, Droplets, Wind, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const knowledgeCategories = [
  {
    id: "natural-disasters",
    title: "Natural Disasters",
    icon: AlertTriangle,
    color: "text-orange-600",
    articles: [
      { title: "Earthquake Preparedness Guide", readTime: "8 min", difficulty: "Beginner" },
      { title: "Hurricane Evacuation Planning", readTime: "12 min", difficulty: "Intermediate" },
      { title: "Wildfire Safety Protocols", readTime: "6 min", difficulty: "Beginner" },
      { title: "Flood Response Strategies", readTime: "10 min", difficulty: "Intermediate" },
    ],
  },
  {
    id: "home-security",
    title: "Home Security",
    icon: Home,
    color: "text-blue-600",
    articles: [
      { title: "Home Defense Basics", readTime: "15 min", difficulty: "Beginner" },
      { title: "Security System Setup", readTime: "20 min", difficulty: "Advanced" },
      { title: "Safe Room Construction", readTime: "25 min", difficulty: "Advanced" },
      { title: "Perimeter Security", readTime: "18 min", difficulty: "Intermediate" },
    ],
  },
  {
    id: "power-outages",
    title: "Power & Utilities",
    icon: Zap,
    color: "text-yellow-600",
    articles: [
      { title: "Generator Safety Guide", readTime: "10 min", difficulty: "Intermediate" },
      { title: "Solar Power Basics", readTime: "14 min", difficulty: "Beginner" },
      { title: "Water Storage Methods", readTime: "12 min", difficulty: "Beginner" },
      { title: "Alternative Heating Sources", readTime: "16 min", difficulty: "Intermediate" },
    ],
  },
  {
    id: "medical",
    title: "Medical & First Aid",
    icon: Users,
    color: "text-red-600",
    articles: [
      { title: "First Aid Fundamentals", readTime: "20 min", difficulty: "Beginner" },
      { title: "Medication Management", readTime: "8 min", difficulty: "Beginner" },
      { title: "Trauma Response", readTime: "25 min", difficulty: "Advanced" },
      { title: "Mental Health in Emergencies", readTime: "12 min", difficulty: "Intermediate" },
    ],
  },
]

const featuredArticles = [
  {
    title: "Complete Family Emergency Plan",
    description: "Step-by-step guide to creating a comprehensive emergency plan for your family",
    category: "Planning",
    readTime: "30 min",
    difficulty: "Beginner",
    featured: true,
  },
  {
    title: "72-Hour Kit Essentials",
    description: "Everything you need to survive the first 72 hours of any emergency",
    category: "Supplies",
    readTime: "15 min",
    difficulty: "Beginner",
    featured: true,
  },
  {
    title: "Communication During Disasters",
    description: "Maintaining contact with family and emergency services when networks fail",
    category: "Communications",
    readTime: "18 min",
    difficulty: "Intermediate",
    featured: true,
  },
]

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-sans">Knowledge Base</h1>
          <p className="text-muted-foreground">Learn essential emergency preparedness skills and strategies</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search articles and guides..." className="pl-10" />
          </div>
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            My Bookmarks
          </Button>
        </div>
      </div>

      {/* Featured Articles */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold font-sans">Featured Articles</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredArticles.map((article, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{article.category}</Badge>
                  <Badge variant="outline">{article.difficulty}</Badge>
                </div>
                <CardTitle className="text-lg font-sans">{article.title}</CardTitle>
                <CardDescription>{article.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{article.readTime} read</span>
                  <Button variant="ghost" size="sm">
                    Read Article
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Knowledge Categories */}
      <Tabs defaultValue="natural-disasters" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {knowledgeCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              <category.icon className={`h-4 w-4 ${category.color}`} />
              <span className="hidden sm:inline">{category.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {knowledgeCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <category.icon className={`h-6 w-6 ${category.color}`} />
              <h3 className="text-2xl font-semibold font-sans">{category.title}</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {category.articles.map((article, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-sans">{article.title}</CardTitle>
                      <Badge variant="outline">{article.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{article.readTime} read</span>
                      <Button variant="ghost" size="sm">
                        Read Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="font-sans">Quick Tips</CardTitle>
          <CardDescription>Essential preparedness reminders</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Droplets className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium">Water Storage</p>
              <p className="text-sm text-muted-foreground">Store 1 gallon per person per day for at least 3 days</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Wind className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">Emergency Communications</p>
              <p className="text-sm text-muted-foreground">
                Keep battery-powered or hand-crank radio for emergency updates
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
            <Flame className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium">Fire Safety</p>
              <p className="text-sm text-muted-foreground">
                Test smoke detectors monthly and replace batteries annually
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
