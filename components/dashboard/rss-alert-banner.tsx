"use client"

import { useState, useEffect, useRef } from "react"
import { Rss, ExternalLink, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Feed } from "@/components/communications/rss-manager"
import { formatDistanceToNow } from "date-fns"

interface BannerItem {
    title: string
    link?: string
    feedName: string
    date?: string
    sourceUrl: string
}

export function RssAlertBanner() {
  const [items, setItems] = useState<BannerItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [paused, setPaused] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchLatestRss()
  }, [])

  // Cycling logic
  useEffect(() => {
    if (items.length > 1 && !paused) {
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length)
        }, 8000) // 8 seconds per item
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [items, paused])

  const fetchLatestRss = async () => {
    setLoading(true)
    setError(false)
    try {
      // 1. Fetch feeds
      const feedsRes = await fetch('/api/communications/feeds')
      if (!feedsRes.ok) {
         // Fallback
         await fetchSingleFeed({ name: "FEMA News", url: "https://www.fema.gov/rss/news-releases.xml" })
         return
      }

      const feeds: Feed[] = await feedsRes.json()
      if (feeds.length === 0) {
           // Fallback if empty DB
           await fetchSingleFeed({ name: "FEMA News", url: "https://www.fema.gov/rss/news-releases.xml" })
           return
      }

      // 2. Fetch items from ALL feeds concurrently
      const allPromises = feeds.map(feed =>
          fetch(`/api/communications/rss?url=${encodeURIComponent(feed.url)}`)
            .then(r => r.json())
            .then(data => ({ feed, data }))
            .catch(e => ({ feed, error: e }))
      )

      const results = await Promise.all(allPromises)

      // 3. Aggregate Latest Items
      const aggregatedItems: BannerItem[] = []

      results.forEach((res: any) => {
          if (res.data && res.data.items && res.data.items.length > 0) {
              // Increased from 2 to 10 to allow more items from a single feed if active
              res.data.items.slice(0, 10).forEach((item: any) => {
                  aggregatedItems.push({
                      title: item.title,
                      link: item.link,
                      feedName: res.feed.name,
                      date: item.pubDate,
                      sourceUrl: res.feed.url
                  })
              })
          }
      })

      // 4. Sort by Date Descending
      aggregatedItems.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateB - dateA
      })

      // Limit to top 25 items total to match Manager view expectation
      const finalItems = aggregatedItems.slice(0, 25)

      if (finalItems.length > 0) {
          setItems(finalItems)
          setCurrentIndex(0)
      } else {
          setItems([]) // Empty state
      }

    } catch (e) {
      console.error(e)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Helper for fallback
  const fetchSingleFeed = async (feed: { name: string, url: string }) => {
      try {
        const res = await fetch(`/api/communications/rss?url=${encodeURIComponent(feed.url)}`)
        if (res.ok) {
            const data = await res.json()
            if (data.items && data.items.length > 0) {
                 const newItems = data.items.slice(0, 10).map((item: any) => ({
                    title: item.title,
                    link: item.link,
                    feedName: feed.name,
                    date: item.pubDate,
                    sourceUrl: feed.url
                 }))
                 setItems(newItems)
            }
        }
      } catch(e) {
          console.error(e)
          setError(true)
      } finally {
          setLoading(false)
      }
  }

  const nextItem = () => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
      setPaused(true) // Pause auto-cycling if user interacts
  }

  const prevItem = () => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
      setPaused(true)
  }

  if (items.length === 0 && !loading) return null

  const activeItem = items[currentIndex]

  return (
    <div
        className="w-full bg-card border rounded-lg shadow-sm overflow-hidden mb-6 animate-in fade-in slide-in-from-top-2 duration-500"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
    >
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-between">
             <div className="flex items-center space-x-2 text-sm font-semibold text-primary font-heading">
                 <Rss className="h-4 w-4" />
                 <span>Latest Updates ({currentIndex + 1}/{items.length})</span>
             </div>
             <div className="flex items-center gap-1">
                 <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={prevItem} disabled={items.length <= 1}>
                     <ChevronLeft className="h-3 w-3" />
                 </Button>
                 <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={nextItem} disabled={items.length <= 1}>
                     <ChevronRight className="h-3 w-3" />
                 </Button>
                 <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-2" onClick={fetchLatestRss}>
                     <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                 </Button>
             </div>
        </div>
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 relative min-h-[60px]">
             {loading ? (
                 <div className="w-full space-y-2">
                     <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
                     <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                 </div>
             ) : error ? (
                 <div className="text-sm text-destructive flex items-center">
                     <AlertCircle className="h-4 w-4 mr-2" />
                     Failed to load feed data.
                 </div>
             ) : activeItem ? (
                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full animate-in fade-in duration-300 key={currentIndex}">
                     {/* Key change triggers animation */}
                     <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px] font-normal whitespace-nowrap">
                             {activeItem.feedName}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {activeItem.date ? formatDistanceToNow(new Date(activeItem.date), { addSuffix: true }) : 'Recent'}
                        </span>
                     </div>
                    <p className="text-sm font-medium font-body flex-1 line-clamp-1 sm:line-clamp-1">
                        {activeItem.title}
                    </p>
                    {activeItem.link && (
                        <a
                            href={activeItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-xs font-semibold text-primary flex items-center hover:underline whitespace-nowrap"
                        >
                            Read Story <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                    )}
                 </div>
             ) : (
                 <div className="text-sm text-muted-foreground">No updates found.</div>
             )}
        </div>
    </div>
  )
}
