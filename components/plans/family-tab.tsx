"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { User, PawPrint } from "lucide-react"
import { Pet } from "./plan-builder"

export interface FamilyMember {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface FamilyTabProps {
    allFamilyMembers: FamilyMember[];
    selectedMemberIds: Set<string>;
    onSelectionChange: (memberId: string) => void;
    allPets: Pet[];
    selectedPetIds: Set<string>;
    onPetSelectionChange: (petId: string) => void;
}

export function FamilyTab({ allFamilyMembers, selectedMemberIds, onSelectionChange, allPets, selectedPetIds, onPetSelectionChange }: FamilyTabProps) {

    return (
        <div className="space-y-6">
            <h3 className="font-semibold mb-4">Select Family Members for this Plan</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {allFamilyMembers.length === 0 ? (
                    <p className="text-muted-foreground text-center p-4">No family members have been added in your account settings.</p>
                ) : (
                    allFamilyMembers.map((member) => (
                        <div
                            key={member.id}
                            className="flex items-center p-3 rounded-md border has-[:checked]:bg-muted transition-colors"
                        >
                            <Checkbox
                                id={`member-${member.id}`}
                                checked={selectedMemberIds.has(member.id)}
                                onCheckedChange={() => onSelectionChange(member.id)}
                            />
                            <Label htmlFor={`member-${member.id}`} className="ml-3 flex items-center cursor-pointer w-full">
                                <User className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div className="flex-grow">
                                    <p className="font-medium">{member.first_name} {member.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                </div>
                            </Label>
                        </div>
                    ))
                )}
            </div>

            <h3 className="font-semibold mb-4 pt-4 border-t">Select Pets for this Plan</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
                {allPets.length === 0 ? (
                    <p className="text-muted-foreground text-center p-4">No pets have been added in your account settings.</p>
                ) : (
                    allPets.map((pet) => (
                        <div
                            key={pet.id}
                            className="flex items-center p-3 rounded-md border has-[:checked]:bg-muted transition-colors"
                        >
                            <Checkbox
                                id={`pet-${pet.id}`}
                                checked={selectedPetIds.has(pet.id)}
                                onCheckedChange={() => onPetSelectionChange(pet.id)}
                            />
                            <Label htmlFor={`pet-${pet.id}`} className="ml-3 flex items-center cursor-pointer w-full">
                                <PawPrint className="h-5 w-5 mr-3 text-muted-foreground" />
                                <div className="flex-grow">
                                    <p className="font-medium">{pet.name}</p>
                                    <p className="text-sm text-muted-foreground">{pet.species} - {pet.breed}</p>
                                </div>
                            </Label>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
