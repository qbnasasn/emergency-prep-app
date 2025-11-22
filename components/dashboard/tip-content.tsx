"use client"

import parse from "html-react-parser"
import DOMPurify from "isomorphic-dompurify"

export function TipContent({ content }: { content: string }) {
  const sanitizedContent = content ? DOMPurify.sanitize(content) : ""

  return (
    <div className="font-body text-sm text-muted-foreground leading-relaxed prose dark:prose-invert max-w-none prose-p:my-1 prose-headings:text-sm prose-ul:my-1 prose-li:my-0">
        {parse(sanitizedContent)}
    </div>
  )
}
