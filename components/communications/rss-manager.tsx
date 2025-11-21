"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Rss, Plus, Trash2, ExternalLink, RefreshCw, Loader2, Pencil, Check, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { formatDistanceToNow, parseISO, isToday, isAfter, subDays } from "date-fns"

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

  // Form State
  const [feedUrl, setFeedUrl] = useState("")
  const [feedName, setFeedName] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Filter State
  const [filter, setFilter] = useState("all")

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
            setFeeds(data)
            if (data.length > 0) {
                if (!activeFeed) setActiveFeed(data[0])
            } else {
                const defaultFeed = { name: "FEMA National News", url: DEFAULT_FEED_URL }
                setFeeds([defaultFeed])
                setActiveFeed(defaultFeed)
            }
        } else {
            console.warn("Failed to fetch feeds, falling back to default")
            const defaultFeed = { name: "FEMA National News", url: DEFAULT_FEED_URL }
            setFeeds([defaultFeed])
            setActiveFeed(defaultFeed)
        }
    } catch (e) {
        console.error(e)
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
      if (!isEditing) {
         setFeedName("")
         setFeedUrl("")
      }
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

  const startEditing = (feed: Feed) => {
      setIsEditing(true)
      setEditingId(feed.id || null)
      setFeedName(feed.name)
      setFeedUrl(feed.url)
  }

  const cancelEditing = () => {
      setIsEditing(false)
      setEditingId(null)
      setFeedName("")
      setFeedUrl("")
  }

  const handleSave = async () => {
    if (!feedUrl || !feedName) return
    setSubmitting(true)

    try {
        if (isEditing && editingId) {
            const res = await fetch(`/api/communications/feeds/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: feedName, url: feedUrl })
            })
            if (res.ok) {
                const updatedFeed = await res.json()
                const updatedFeeds = feeds.map(f => f.id === editingId ? updatedFeed : f)
                setFeeds(updatedFeeds)
                setActiveFeed(updatedFeed)
                toast.success("Feed updated")
                cancelEditing()
            } else {
                toast.error("Failed to update feed")
            }
        } else {
            const res = await fetch('/api/communications/feeds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: feedName, url: feedUrl })
            })
            if (res.ok) {
                const newFeed = await res.json()
                setFeeds([...feeds, newFeed])
                setActiveFeed(newFeed)
                toast.success("Feed added")
                cancelEditing()
            } else {
                toast.error("Failed to add feed")
            }
        }
    } catch(e) {
        console.error(e)
        toast.error("Error saving feed")
    } finally {
        setSubmitting(false)
    }
  }

  const removeFeed = async (feed: Feed) => {
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

  const filteredItems = feedData?.items?.filter(item => {
      if (!item.pubDate) return true
      const date = new Date(item.pubDate)

      switch (filter) {
          case "today":
              return isToday(date)
          case "24h":
              return isAfter(date, subDays(new Date(), 1))
          case "7days":
               return isAfter(date, subDays(new Date(), 7))
          default:
              return true
      }
  })

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 font-body">
          <Rss className="h-3.5 w-3.5" />
          <span>Manage Feeds</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading">RSS Feed Manager</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden pt-4">
          {/* Sidebar */}
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
                            className={`group flex items-center justify-between p-2 rounded-md cursor-pointer text-sm ${activeFeed?.url === feed.url ? 'bg-secondary' : 'hover:bg-muted'}`}
                            onClick={() => {
                                setActiveFeed(feed)
                                if(isEditing && editingId !== feed.id) cancelEditing()
                            }}
                        >
                            <span className="truncate font-body max-w-[100px]">{feed.name}</span>
                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {feed.id && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); startEditing(feed) }}>
                                        <Pencil className="h-3 w-3 text-muted-foreground hover:text-primary" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); removeFeed(feed) }}>
                                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                </Button>
                            </div>
                        </div>
                        ))
                    )}
                  </div>
                </ScrollArea>
            </div>

            <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium font-body">{isEditing ? "Edit Feed" : "Add New Feed"}</h3>
                    {isEditing && (
                        <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={cancelEditing}>Cancel</Button>
                    )}
                </div>
                <Input
                    placeholder="Feed Name"
                    value={feedName}
                    onChange={e => setFeedName(e.target.value)}
                    className="h-8 font-body text-xs"
                />
                <Input
                    placeholder="Feed URL"
                    value={feedUrl}
                    onChange={e => setFeedUrl(e.target.value)}
                    className="h-8 font-body text-xs"
                />
                <Button onClick={handleSave} size="sm" className="w-full font-body" disabled={!feedUrl || !feedName || submitting}>
                    {submitting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : isEditing ? <Check className="h-3 w-3 mr-2" /> : <Plus className="h-3 w-3 mr-2" />}
                    {isEditing ? "Update Feed" : "Add Feed"}
                </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 overflow-hidden">
                     <h3 className="font-heading font-semibold text-lg truncate max-w-[200px]">{feedData?.name || activeFeed?.name || "Select a feed"}</h3>
                     <div className="w-[140px]">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="h-8 text-xs font-body">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Items</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="24h">Last 24 Hours</SelectItem>
                                <SelectItem value="7days">Last 7 Days</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => activeFeed && fetchFeedContent(activeFeed.url)} disabled={loading || !activeFeed}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <ScrollArea className="flex-1 pr-4 -mr-4">
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-muted-foreground font-body">
                        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading feed...
                    </div>
                ) : filteredItems?.length ? (
                    <div className="space-y-4 pb-4">
                        {filteredItems.map((item, idx) => (
                            <div key={idx} className="border rounded-lg p-3 space-y-2 bg-background">
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-semibold text-sm font-body text-foreground">
                                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-primary">
                                            {item.title}
                                        </a>
                                    </h4>
                                    <Badge variant="outline" className="text-[10px] shrink-0">
                                        {item.pubDate ? formatDistanceToNow(new Date(item.pubDate), { addSuffix: true }) : 'Recent'}
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
                        {activeFeed ? `No items found matching filter "${filter}".` : "Select a feed to view items."}
                    </div>
                )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
