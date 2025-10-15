'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, User, Trash2, Edit } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FamilyMemberForm } from './family-member-form'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export function FamilyMembers() {
  const [members, setMembers] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/family-members')
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      } else {
        console.error('Failed to fetch family members')
        setMembers([])
      }
    } catch (error) {
      console.error('Error fetching family members:', error)
      setMembers([])
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleAdd = () => {
    setSelectedMember(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (member) => {
    setSelectedMember(member)
    setIsDialogOpen(true)
  }

  const handleDelete = (member) => {
    setSelectedMember(member)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedMember) return;
    await fetch(`/api/family-members/${selectedMember.id}`, { method: 'DELETE' });
    setIsDeleteDialogOpen(false);
    setSelectedMember(null);
    fetchMembers();
  };

  const handleFormSubmit = async (values) => {
    const method = selectedMember ? 'PUT' : 'POST'
    const url = selectedMember
      ? `/api/family-members/${selectedMember.id}`
      : '/api/family-members'

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    setIsDialogOpen(false)
    fetchMembers()
  }

  const formatHeight = (inches) => {
    if (!inches) return '';
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}' ${remainingInches}"`;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-lg flex items-center">
            <User className="h-5 w-5 mr-2" />
            Family Members & Contacts
          </CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{member.first_name} {member.last_name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.birth_date ? new Date(member.birth_date).toLocaleDateString() : ''}
                    {member.height_inches ? ` | ${formatHeight(member.height_inches)}` : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(member)}>
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
            <DialogTitle>{selectedMember ? 'Edit' : 'Add'} Family Member</DialogTitle>
          </DialogHeader>
          <FamilyMemberForm onFormSubmit={handleFormSubmit} initialData={selectedMember} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedMember?.first_name} {selectedMember?.last_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedMember(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
