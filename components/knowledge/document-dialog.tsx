"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2, Upload, FileText } from "lucide-react"
import { createDocument, updateDocument, KnowledgeDocument } from "@/lib/actions/knowledge"
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["article", "guide", "tip"]),
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
      title: document?.title || "",
      type: (document?.type as "article" | "guide" | "tip") || "article",
      category: document?.category || "",
      content: document?.content || "",
    },
  })

  // Reset form when document changes
  const { reset } = form
  // useEffect(() => {
  //   if (document) {
  //     reset({
  //       title: document.title,
  //       type: document.type as any,
  //       category: document.category || "",
  //       content: document.content || "",
  //     })
  //   } else {
  //     reset({
  //       title: "",
  //       type: "article",
  //       category: "",
  //       content: "",
  //     })
  //   }
  // }, [document, reset])
  // Using key on Dialog in parent is better to reset state

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
      form.setValue("content", text)
      // Also guess title from filename if empty
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document ? "Edit Document" : "Create New Document"}</DialogTitle>
          <DialogDescription>
            {document ? "Update your knowledge base document." : "Add a new article, guide, or tip to your knowledge base."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="article">Article</SelectItem>
                        <SelectItem value="guide">Guide</SelectItem>
                        <SelectItem value="tip">Tip</SelectItem>
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
                    <FormControl>
                      <Input placeholder="e.g., Water, First Aid" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between items-center">
                    <span>Content</span>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="h-3 w-3 mr-1" /> Import File
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
                    <Textarea
                        placeholder="Write your content here..."
                        className="min-h-[300px] font-mono text-sm"
                        {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
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
