"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Rss, ExternalLink, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Feed } from "@/components/communications/rss-manager"

export function RssAlertBanner() {
  const [latestItem, setLatestItem] = useState<{ title: string, link?: string, feedName: string, date?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchLatestRss()
  }, [])

  const fetchLatestRss = async () => {
    setLoading(true)
    setError(false)
    try {
      // First fetch the list of feeds
      const feedsRes = await fetch('/api/communications/feeds')
      if (!feedsRes.ok) {
        // Fallback to default if no DB table or error
        // Use the hardcoded one from manager default if needed, or just show nothing
        // For "banner", we want to be unintrusive if empty.
         // Try default feed logic
         fetchFeedContent({ name: "FEMA News", url: "https://www.fema.gov/rss/news-releases.xml" })
         return
      }

      const feeds = await feedsRes.json()

      // Use the first feed, or "Global Disaster Services" if found?
      // User said "I need getting an RSS feed banner... I used one for news".
      // Let's assume the first available feed is the "Primary" one.
      // Or prioritize "Global Disaster Services" if it exists.
      let activeFeed = feeds.length > 0 ? feeds[0] : null

      const priorityFeed = feeds.find((f: Feed) => f.name.includes("Global Disaster Services") || f.name.includes("FEMA"))
      if (priorityFeed) activeFeed = priorityFeed

      if (activeFeed) {
         await fetchFeedContent(activeFeed)
      } else {
         // No feeds at all
         setLatestItem(null)
         setLoading(false)
      }
    } catch (e) {
      console.error(e)
      setError(true)
      setLoading(false)
    }
  }

  const fetchFeedContent = async (feed: { name: string, url: string }) => {
     try {
        const res = await fetch(`/api/communications/rss?url=${encodeURIComponent(feed.url)}`)
        if (res.ok) {
            const data = await res.json()
            if (data.items && data.items.length > 0) {
                const item = data.items[0]
                setLatestItem({
                    title: item.title,
                    link: item.link,
                    feedName: feed.name,
                    date: item.pubDate
                })
            }
        }
     } catch (e) {
         console.error("Failed to fetch feed content", e)
     } finally {
         setLoading(false)
     }
  }

  if (!latestItem && !loading) return null

  return (
    <div className="w-full bg-card border rounded-lg shadow-sm overflow-hidden mb-6 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-between">
             <div className="flex items-center space-x-2 text-sm font-semibold text-primary font-heading">
                 <Rss className="h-4 w-4" />
                 <span>Latest Update: {latestItem?.feedName || "Loading Feed..."}</span>
             </div>
             <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={fetchLatestRss}>
                 <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
             </Button>
        </div>
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
             {loading ? (
                 <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
             ) : error ? (
                 <div className="text-sm text-destructive flex items-center">
                     <AlertCircle className="h-4 w-4 mr-2" />
                     Failed to load feed data.
                 </div>
             ) : (
                 <>
                    <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
                        {latestItem?.date ? new Date(latestItem.date).toLocaleDateString() : 'Today'}
                    </Badge>
                    <p className="text-sm font-medium font-body flex-1 truncate pr-4">
                        {latestItem?.title}
                    </p>
                    {latestItem?.link && (
                        <a
                            href={latestItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-xs font-semibold text-primary flex items-center hover:underline"
                        >
                            Read Full Story <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                    )}
                 </>
             )}
        </div>
    </div>
  )
}
