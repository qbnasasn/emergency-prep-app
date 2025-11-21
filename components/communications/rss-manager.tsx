"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Rss, Plus, Trash2, ExternalLink, RefreshCw, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export interface FeedItem {
  title?: string
  link?: string
  pubDate?: string
  contentSnippet?: string
}

export interface Feed {
  id?: string
  url: string
  name: string
  items?: FeedItem[]
  lastUpdated?: string
}

const DEFAULT_FEED_URL = "https://www.fema.gov/rss/news-releases.xml"

export function RssFeedManager({ onUpdateCount }: { onUpdateCount: (count: number) => void }) {
  const [feeds, setFeeds] = useState<Feed[]>([])
  const [activeFeed, setActiveFeed] = useState<Feed | null>(null)
  const [feedData, setFeedData] = useState<Feed | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingFeeds, setLoadingFeeds] = useState(true)
  const [newFeedUrl, setNewFeedUrl] = useState("")
  const [newFeedName, setNewFeedName] = useState("")
  const [adding, setAdding] = useState(false)

  // Load feeds from API
  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    setLoadingFeeds(true)
    try {
        const res = await fetch('/api/communications/feeds')
        if (res.ok) {
            const data = await res.json()
            // If user has no feeds, maybe suggest adding defaults?
            // Or just show empty state.
            // If database is empty, we can default to FEMA on the client side *display* but not save it?
            // Better: If empty, show FEMA as a "default" option or auto-add it.
            // Let's just use the data.
            setFeeds(data)
            if (data.length > 0) {
                setActiveFeed(data[0])
            } else {
                // Fallback if no feeds exist in DB
                const defaultFeed = { name: "FEMA National News", url: DEFAULT_FEED_URL }
                setFeeds([defaultFeed])
                setActiveFeed(defaultFeed)
            }
        } else {
            // If API fails (e.g. table missing), fallback to local default for demo
            console.warn("Failed to fetch feeds, falling back to default")
            const defaultFeed = { name: "FEMA National News", url: DEFAULT_FEED_URL }
            setFeeds([defaultFeed])
            setActiveFeed(defaultFeed)
        }
    } catch (e) {
        console.error(e)
        // Fallback
        const defaultFeed = { name: "FEMA National News", url: DEFAULT_FEED_URL }
        setFeeds([defaultFeed])
        setActiveFeed(defaultFeed)
    } finally {
        setLoadingFeeds(false)
    }
  }

  useEffect(() => {
    if (activeFeed) {
      fetchFeedContent(activeFeed.url)
    }
  }, [activeFeed])

  const fetchFeedContent = async (url: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/communications/rss?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const data = await res.json()
        setFeedData({ ...data, url, name: activeFeed?.name || "Unknown Feed" })
        if (onUpdateCount) {
            onUpdateCount(data.items?.length || 0)
        }
      } else {
        console.error("Failed to fetch feed content")
        toast.error("Failed to fetch RSS feed content")
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const addFeed = async () => {
    if (newFeedUrl && newFeedName) {
      setAdding(true)
      try {
        const res = await fetch('/api/communications/feeds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newFeedName, url: newFeedUrl })
        })

        if (res.ok) {
            const newFeed = await res.json()
            setFeeds([...feeds, newFeed])
            setNewFeedUrl("")
            setNewFeedName("")
            setActiveFeed(newFeed)
            toast.success("Feed added successfully")
        } else {
            toast.error("Failed to save feed")
        }
      } catch (e) {
          console.error(e)
          toast.error("Error adding feed")
      } finally {
          setAdding(false)
      }
    }
  }

  const removeFeed = async (feed: Feed) => {
    // If it's a database feed (has ID), delete it.
    // If it's the default fallback (no ID), just remove from state.
    if (feed.id) {
        try {
            const res = await fetch(`/api/communications/feeds/${feed.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error("Failed to delete")
        } catch (e) {
            toast.error("Failed to delete feed")
            return
        }
    }

    const newFeeds = feeds.filter(f => f.url !== feed.url)
    setFeeds(newFeeds)

    if (activeFeed?.url === feed.url) {
      setActiveFeed(newFeeds.length > 0 ? newFeeds[0] : null)
      setFeedData(null)
      onUpdateCount(0)
    }
    toast.success("Feed removed")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 font-body">
          <Rss className="h-3.5 w-3.5" />
          <span>Manage Feeds</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading">RSS Feed Manager</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden pt-4">
          {/* Sidebar: Feed List */}
          <div className="flex flex-col space-y-4 border-r pr-4">
            <div className="space-y-2">
                <h3 className="text-sm font-medium font-body">Your Feeds</h3>
                <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                  <div className="space-y-2">
                    {loadingFeeds ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    ) : feeds.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No feeds added.</p>
                    ) : (
                        feeds.map((feed) => (
                        <div
                            key={feed.id || feed.url}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-sm ${activeFeed?.url === feed.url ? 'bg-secondary' : 'hover:bg-muted'}`}
                            onClick={() => setActiveFeed(feed)}
                        >
                            <span className="truncate font-body">{feed.name}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); removeFeed(feed) }}>
                                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                            </Button>
                        </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
            </div>

            <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-medium font-body">Add New Feed</h3>
                <Input
                    placeholder="Feed Name"
                    value={newFeedName}
                    onChange={e => setNewFeedName(e.target.value)}
                    className="h-8 font-body text-xs"
                />
                <Input
                    placeholder="Feed URL"
                    value={newFeedUrl}
                    onChange={e => setNewFeedUrl(e.target.value)}
                    className="h-8 font-body text-xs"
                />
                <Button onClick={addFeed} size="sm" className="w-full font-body" disabled={!newFeedUrl || !newFeedName || adding}>
                    {adding ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                    Add Feed
                </Button>
            </div>
          </div>

          {/* Main Content: Feed Items */}
          <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-lg truncate">{feedData?.name || activeFeed?.name || "Select a feed"}</h3>
                <Button variant="ghost" size="icon" onClick={() => activeFeed && fetchFeedContent(activeFeed.url)} disabled={loading || !activeFeed}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground font-body">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading feed...
                    </div>
                ) : feedData?.items?.length ? (
                    <div className="space-y-4 pb-4">
                        {feedData.items.map((item, idx) => (
                            <div key={idx} className="border rounded-lg p-3 space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-semibold text-sm font-body text-foreground">
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-primary">
                                            {item.title}
                                        </a>
                                    </h4>
                                    <Badge variant="outline" className="text-[10px] shrink-0">
                                        {item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recent'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground font-body line-clamp-3">
                                    {item.contentSnippet || "No description available."}
                                </p>
                                {item.link && (
                                    <div className="flex justify-end">
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center hover:underline font-body">
                                            Read more <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8 font-body">
                        {activeFeed ? "No items found or failed to load." : "Select a feed to view items."}
                    </div>
                )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
