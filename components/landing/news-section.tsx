import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface NewsSectionProps {
  announcements: any[]
}

export function NewsSection({ announcements }: NewsSectionProps) {
  if (!announcements || announcements.length === 0) {
    return null
  }

  return (
    <section id="news" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4 text-slate-900">Latest News & Updates</h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Stay informed about the latest preparedness tips, product updates, and community announcements.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {announcements.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.image_url && (
                <div className="relative h-48 w-full">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="line-clamp-2">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4 line-clamp-3">
                  {item.content}
                </p>
                {item.target_link && (
                  <Link
                    href={item.target_link}
                    target="_blank"
                    className="inline-flex items-center text-primary font-medium hover:underline"
                  >
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
