"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { KnowledgeDocument } from "@/lib/actions/knowledge"
import { format } from "date-fns"
import { getCategoryById } from "@/lib/knowledge-config"
import parse from "html-react-parser"
import DOMPurify from "isomorphic-dompurify"

interface DocumentViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: KnowledgeDocument | null
}

export function DocumentViewer({ open, onOpenChange, document }: DocumentViewerProps) {
  if (!document) return null

  const category = getCategoryById(document.category || "other")

  // Sanitize content before parsing
  const sanitizedContent = document.content ? DOMPurify.sanitize(document.content) : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
            <div className="flex items-center gap-2 mb-2">
                <Badge variant={document.type === 'tip' ? 'secondary' : 'default'}>
                    {document.type.toUpperCase()}
                </Badge>
                {category && (
                    <Badge variant="outline" className={`gap-1 ${category.color} ${category.bg} ${category.border}`}>
                        <category.icon className="h-3 w-3" />
                        {category.label}
                    </Badge>
                )}
            </div>
          <DialogTitle className="text-2xl font-heading">{document.title}</DialogTitle>
          <div className="text-sm text-muted-foreground">
             Last updated: {format(new Date(document.updated_at), 'PPP')}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
            <div className="prose dark:prose-invert max-w-none font-sans ql-editor px-0">
                {sanitizedContent ? parse(sanitizedContent) : <span className="text-muted-foreground italic">No content.</span>}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
