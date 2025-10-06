"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { Kit } from "@/lib/data/kits"
import { deleteKit } from "@/lib/actions/kits"

interface KitCardActionsProps {
  kit: Kit;
  onEditKit: (kit: Kit) => void;
  onDataChange: () => void;
}

export function KitCardActions({ kit, onEditKit, onDataChange }: KitCardActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteKit(kit.id);
    setIsDeleting(false);
    if (result.success) {
      toast.success("Kit deleted successfully.");
      setIsDeleteDialogOpen(false);
      onDataChange(); // Trigger data refetch
    } else {
      toast.error(result.message || "Failed to delete kit.");
    }
  };

  return (
    <>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => onEditKit(kit)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the kit
              and all of its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}