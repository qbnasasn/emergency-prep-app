"use client"

import { useState, useMemo } from "react"
import { Search, BookOpen, AlertTriangle, Users, Home, Zap, Droplets, Wind, Flame, Plus, Filter, FileText, Lightbulb, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { KnowledgeDocument, toggleFavorite, deleteDocument } from "@/lib/actions/knowledge"
import { DocumentDialog } from "@/components/knowledge/document-dialog"
import { DocumentViewer } from "@/components/knowledge/document-viewer"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { KNOWLEDGE_CATEGORIES, getCategoryById } from "@/lib/knowledge-config"
import DOMPurify from "isomorphic-dompurify"

interface KnowledgePageProps {
    documents: KnowledgeDocument[]
}

export default function KnowledgePageClient({ documents }: KnowledgePageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeType, setActiveType] = useState("all")
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null)
  const router = useRouter()

  const filteredDocs = useMemo(() => {
    let docs = documents

    // Filter by Type (Article, Guide, Tip, Favorites)
    if (activeType === "favorites") {
        docs = docs.filter(d => d.is_favorite)
    } else if (activeType !== "all") {
        docs = docs.filter(d => d.type === activeType)
    }

    // Filter by Category
    if (activeCategory !== "all") {
        docs = docs.filter(d => d.category === activeCategory)
    }

    if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase()
        docs = docs.filter(d =>
            d.title.toLowerCase().includes(lowerQ) ||
            d.content?.toLowerCase().includes(lowerQ) ||
            d.category?.toLowerCase().includes(lowerQ)
        )
    }
    return docs
  }, [documents, activeType, activeCategory, searchQuery])

  const handleFavorite = async (e: React.MouseEvent, doc: KnowledgeDocument) => {
    e.stopPropagation()
    try {
        await toggleFavorite(doc.id)
        toast.success(doc.is_favorite ? "Removed from bookmarks" : "Added to bookmarks")
        router.refresh()
    } catch (err) {
        toast.error("Failed to update bookmark")
    }
  }

  const handleDelete = async (e: React.MouseEvent, doc: KnowledgeDocument) => {
      e.stopPropagation()
      if (!confirm("Are you sure you want to delete this document?")) return
      try {
          await deleteDocument(doc.id)
          toast.success("Document deleted")
          router.refresh()
      } catch (err) {
          toast.error("Failed to delete")
      }
  }

  const openViewer = (doc: KnowledgeDocument) => {
      setSelectedDoc(doc)
      setIsViewerOpen(true)
  }

  const openEditor = (doc?: KnowledgeDocument) => {
      setEditingDoc(doc || null)
      setIsEditorOpen(true)
  }

  // Helper to strip HTML for preview
  const stripHtml = (html: string) => {
      if (!html) return ""
      // Sanitize first to be safe, then strip
      const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
      return clean.substring(0, 150) + (clean.length > 150 ? "..." : "")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold font-heading">Knowledge Base</h1>
          <p className="text-muted-foreground">Learn essential emergency preparedness skills and strategies</p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={() => openEditor()}>
                <Plus className="mr-2 h-4 w-4" /> Add Document
            </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
         <div className="flex-1 w-full flex flex-col sm:flex-row gap-4">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="w-full sm:w-64">
                <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {KNOWLEDGE_CATEGORIES.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                                    <span>{cat.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
         </div>

          <Tabs value={activeType} onValueChange={setActiveType} className="w-full lg:w-auto">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="article">Articles</TabsTrigger>
                <TabsTrigger value="guide">Guides</TabsTrigger>
                <TabsTrigger value="favorites" className="text-yellow-600 data-[state=active]:text-yellow-700">
                    <Bookmark className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Saved</span>
                </TabsTrigger>
            </TabsList>
          </Tabs>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
                const category = getCategoryById(doc.category || "other")
                return (
                    <Card
                        key={doc.id}
                        className="cursor-pointer hover:shadow-md transition-shadow group flex flex-col overflow-hidden"
                        onClick={() => openViewer(doc)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${category.bg} ${category.color} border ${category.border}`}>
                             <category.icon className="h-3.5 w-3.5" />
                             {category.label}
                          </div>
                          <Badge variant={doc.type === 'tip' ? 'secondary' : 'outline'} className="capitalize">
                            {doc.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-sans line-clamp-2 leading-tight">{doc.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="text-sm text-muted-foreground line-clamp-3">
                             {stripHtml(doc.content || "")}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 flex justify-between items-center text-sm text-muted-foreground mt-auto">
                          <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 hover:text-yellow-600 ${doc.is_favorite ? "text-yellow-500" : ""}`}
                                onClick={(e) => handleFavorite(e, doc)}
                            >
                                <Bookmark className={`h-4 w-4 ${doc.is_favorite ? "fill-current" : ""}`} />
                            </Button>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {/* Only show edit/delete if user owns it (doc.user_id is not null) */}
                             {doc.user_id && (
                                 <>
                                    <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); openEditor(doc); }}>
                                        Edit
                                    </Button>
                                    <Button variant="ghost" size="xs" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={(e) => handleDelete(e, doc)}>
                                        Delete
                                    </Button>
                                 </>
                             )}
                          </div>
                      </CardFooter>
                    </Card>
                  )
            })
        ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No documents found matching your criteria.</p>
                {(searchQuery || activeCategory !== 'all') && <Button variant="link" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>Clear filters</Button>}
            </div>
        )}
      </div>

      <DocumentDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        document={editingDoc}
        onSuccess={() => router.refresh()}
      />

      <DocumentViewer
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        document={selectedDoc}
      />
    </div>
  )
}
