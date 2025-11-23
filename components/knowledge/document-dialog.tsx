"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Upload } from "lucide-react"
import { createDocument, updateDocument, KnowledgeDocument } from "@/lib/actions/knowledge"
import { toast } from "sonner"
import { KNOWLEDGE_CATEGORIES } from "@/lib/knowledge-config"
import dynamic from "next/dynamic"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
    ssr: false,
    loading: () => <div className="h-64 w-full bg-muted animate-pulse rounded-md" />
})
import "react-quill-new/dist/quill.snow.css"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["article", "guide", "tip", "menu"]),
  category: z.string().optional(),
  content: z.string().optional(),
})

interface DocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document?: KnowledgeDocument | null
  onSuccess: () => void
}

export function DocumentDialog({ open, onOpenChange, document, onSuccess }: DocumentDialogProps) {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "article",
      category: "basics-planning",
      content: "",
    },
  })

  // Reset form when document changes
  useEffect(() => {
    if (document) {
      form.reset({
        title: document.title,
        type: (document.type as "article" | "guide" | "tip" | "menu") || "article",
        category: document.category || "basics-planning",
        content: document.content || "",
      })
    } else {
      form.reset({
        title: "",
        type: "article",
        category: "basics-planning",
        content: "",
      })
    }
  }, [document, form, open])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      if (document) {
        const res = await updateDocument(document.id, values)
        if (!res.success) throw new Error(res.error)
        toast.success("Document updated")
      } else {
        const res = await createDocument(values)
        if (!res.success) throw new Error(res.error)
        toast.success("Document created")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "text/plain" && !file.name.endsWith(".md")) {
        toast.error("Only .txt and .md files are supported for import")
        return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      // Append or replace content? Let's append if not empty, or just replace.
      // For rich text, we just put the text in.
      // If it's markdown, we might want to parse it? But for now, raw text is safer.
      const current = form.getValues("content") || ""
      form.setValue("content", current + (current ? "\n\n" : "") + text)

      if (!form.getValues("title")) {
        form.setValue("title", file.name.replace(/\.[^/.]+$/, ""))
      }
      toast.success("File content imported")
    }
    reader.onerror = () => {
        toast.error("Failed to read file")
    }
    reader.readAsText(file)
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>{document ? "Edit Document" : "Create New Document"}</DialogTitle>
          <DialogDescription>
            {document ? "Update your knowledge base document." : "Add a new article, guide, or tip to your knowledge base."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Emergency Plan v1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="tip">Tip</SelectItem>
                        <SelectItem value="menu">Menu</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="flex flex-col flex-1">
                  <FormLabel className="flex justify-between items-center mb-1">
                    <span>Content</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-3 w-3 mr-1" /> Import Text
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".txt,.md"
                        onChange={handleFileUpload}
                    />
                  </FormLabel>
                  <FormControl>
                    <div className="h-64 sm:h-80">
                         <ReactQuill
                            theme="snow"
                            value={field.value}
                            onChange={field.onChange}
                            modules={modules}
                            className="h-full pb-10"
                         />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Document
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
