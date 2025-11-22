"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { KnowledgeDocument } from "@/lib/actions/knowledge"
import { format } from "date-fns"

interface DocumentViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: KnowledgeDocument | null
}

export function DocumentViewer({ open, onOpenChange, document }: DocumentViewerProps) {
  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
            <div className="flex items-center gap-2 mb-2">
                <Badge variant={document.type === 'tip' ? 'secondary' : 'default'}>
                    {document.type.toUpperCase()}
                </Badge>
                {document.category && <Badge variant="outline">{document.category}</Badge>}
            </div>
          <DialogTitle className="text-2xl font-heading">{document.title}</DialogTitle>
          <div className="text-sm text-muted-foreground">
             Last updated: {format(new Date(document.updated_at), 'PPP')}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-sans">
                {document.content}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
