"use client"

import { Suspense, useState } from "react"
import { toast } from "sonner"
import { KitsHeader } from "@/components/kits/kits-header"
import { KitsOverview } from "@/components/kits/kits-overview"
import { KitsList } from "@/components/kits/kits-list"
import { KitBuilderModal } from "@/components/kits/kit-builder-modal"
import { Kit } from "@/lib/data/kits"
"use client"

import { Suspense, useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { KitsHeader } from "@/components/kits/kits-header"
import { KitsOverview } from "@/components/kits/kits-overview"
import { KitsList } from "@/components/kits/kits-list"
import { KitBuilderModal } from "@/components/kits/kit-builder-modal"
import { Kit } from "@/lib/data/kits"
import { createKit, updateKit } from "@/lib/actions/kits"

export default function KitsPage() {
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null)

  const handleOpenModal = (kit: Kit | null = null) => {
    setSelectedKit(kit)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedKit(null)
  }

  const handleSaveKit = async (kitData: any) => {
    const userId = session?.user?.id
    if (!userId) {
      toast.error("You must be logged in to perform this action.")
      return
    }

    try {
      let result;
      if (kitData.id) {
        result = await updateKit(kitData.id, kitData);
        if (result.success) {
          toast.success("Kit updated successfully!")
        } else {
          toast.error(result.message)
        }
      } else {
        result = await createKit(userId, kitData)
        if (result.success) {
          toast.success("Kit created successfully!")
        } else {
          toast.error(result.message)
        }
      }
      if (result.success) {
        handleCloseModal()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred.")
    }
  }

  return (
    <div className="space-y-6">
      <KitsHeader onNewKit={() => handleOpenModal()} />
      <Suspense fallback={<div>Loading kits overview...</div>}>
        <KitsOverview />
      </Suspense>
      <Suspense fallback={<div>Loading kits...</div>}>
        <KitsList onEditKit={handleOpenModal} />
      </Suspense>
      {isModalOpen && (
        <KitBuilderModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveKit}
          kit={selectedKit}
        />
      )}
    </div>
  )
}
