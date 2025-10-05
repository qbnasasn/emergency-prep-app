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
  const [kits, setKits] = useState<Kit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null)

  const fetchKits = async () => {
    if (!session?.user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/kits');
      if (!response.ok) throw new Error('Failed to fetch kits');
      const userKits = await response.json();
      setKits(userKits);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load kits.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKits();
  }, [session]);

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
          toast.error(result.message || "Failed to update kit.")
        }
      } else {
        result = await createKit(userId, kitData)
        if (result.success) {
          toast.success("Kit created successfully!")
        } else {
          toast.error(result.message || "Failed to create kit.")
        }
      }
      if (result.success) {
        handleCloseModal()
        fetchKits() // Refetch data on success
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred.")
    }
  }

  return (
    <div className="space-y-6">
      <KitsHeader onNewKit={() => handleOpenModal()} />
      <KitsOverview kits={kits} isLoading={isLoading} />
      <KitsList kits={kits} isLoading={isLoading} onEditKit={handleOpenModal} onDataChange={fetchKits} />
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