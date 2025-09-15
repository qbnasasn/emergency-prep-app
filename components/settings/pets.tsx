'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, PawPrint, Trash2, Edit } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PetForm } from './pet-form'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export function Pets() {
  const [pets, setPets] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState(null)

  const fetchPets = async () => {
    try {
      const response = await fetch('/api/pets')
      if (response.ok) {
        const data = await response.json()
        setPets(data)
      } else {
        console.error('Failed to fetch pets')
        setPets([])
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
      setPets([])
    }
  }

  useEffect(() => {
    fetchPets()
  }, [])

  const handleAdd = () => {
    setSelectedPet(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (pet) => {
    setSelectedPet(pet)
    setIsDialogOpen(true)
  }

  const handleDelete = (pet) => {
    setSelectedPet(pet)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPet) return;
    await fetch(`/api/pets/${selectedPet.id}`, { method: 'DELETE' });
    setIsDeleteDialogOpen(false);
    setSelectedPet(null);
    fetchPets();
  };

  const handleFormSubmit = async (values) => {
    const method = selectedPet ? 'PUT' : 'POST'
    const url = selectedPet
      ? `/api/pets/${selectedPet.id}`
      : '/api/pets'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    setIsDialogOpen(false)
    fetchPets()
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-lg flex items-center">
            <PawPrint className="h-5 w-5 mr-2" />
            Pets
          </CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Pet
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pets.map((pet) => (
              <div key={pet.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{pet.name}</p>
                  <p className="text-sm text-muted-foreground">{pet.species} - {pet.breed}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(pet)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(pet)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedPet ? 'Edit' : 'Add'} Pet</DialogTitle>
          </DialogHeader>
          <PetForm onFormSubmit={handleFormSubmit} initialData={selectedPet} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedPet?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedPet(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
