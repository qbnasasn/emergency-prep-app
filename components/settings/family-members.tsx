'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, User, Trash2, Edit, Copy, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { FamilyMemberForm } from './family-member-form'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FamilyMembers() {
  const [members, setMembers] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)

  // Family Link State
  const [canInvite, setCanInvite] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [inviteExpiresAt, setInviteExpiresAt] = useState("")
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

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

  const fetchUserStatus = async () => {
      try {
          const res = await fetch('/api/family/invite');
          if (res.ok) {
              const data = await res.json();
              setCanInvite(data.canInvite);
          }
      } catch (e) {
          console.error("Failed to fetch user status", e);
      }
  }

  useEffect(() => {
    fetchMembers()
    fetchUserStatus()
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

  // New Handlers
  const handleGenerateInvite = async () => {
      try {
          const res = await fetch('/api/family/invite', { method: 'POST' });
          const data = await res.json();
          if (res.ok) {
              setInviteCode(data.code);
              setInviteExpiresAt(data.expiresAt);
              setShowInviteDialog(true);
          } else {
              toast.error(data.error || "Failed to generate invite");
          }
      } catch (e) {
          toast.error("Error generating invite");
      }
  }

  const handleJoinHousehold = async () => {
      if (!joinCode) return;
      setIsJoining(true);
      try {
          const res = await fetch('/api/family/invite', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: joinCode })
          });
          const data = await res.json();
          if (res.ok) {
              toast.success(data.message);
              setJoinCode("");
              window.location.reload();
          } else {
              toast.error(data.error || "Failed to join household");
          }
      } catch (e) {
          toast.error("Error joining household");
      } finally {
          setIsJoining(false);
      }
  }

  const copyToClipboard = () => {
      navigator.clipboard.writeText(inviteCode);
      toast.success("Invite code copied!");
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-heading text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Family Members & Contacts
            </CardTitle>
            <CardDescription>Manage your household members.</CardDescription>
          </div>
          <div className="flex space-x-2">
            {canInvite && (
                <Button size="sm" variant="outline" onClick={handleGenerateInvite}>
                    <Users className="h-4 w-4 mr-2" />
                    Invite Family
                </Button>
            )}
            <Button size="sm" onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Join Household Section */}
          {!canInvite && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                <h3 className="text-sm font-medium mb-2">Join a Household</h3>
                <div className="flex gap-2 max-w-sm">
                    <Input
                      placeholder="Enter Invite Code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      className="uppercase"
                      maxLength={6}
                    />
                    <Button onClick={handleJoinHousehold} disabled={isJoining || !joinCode}>
                        {isJoining ? "Joining..." : "Join"}
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    Joining a household will move your inventory items to the new family.
                </p>
            </div>
          )}

          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">{member.first_name} {member.last_name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.birth_date ? new Date(member.birth_date).toLocaleDateString('en-US', { timeZone: 'UTC' }) : ''}
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

      {/* Invite Code Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Invite Family Member</DialogTitle>
                  <DialogDescription>
                      Share this code with your family member. It expires in 24 hours.
                  </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2 my-4">
                  <div className="flex-1 p-3 bg-muted rounded-md text-center font-mono text-xl tracking-widest font-bold border">
                      {inviteCode}
                  </div>
                  <Button size="icon" variant="outline" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                  </Button>
              </div>
              <DialogFooter>
                  <Button onClick={() => setShowInviteDialog(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

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
