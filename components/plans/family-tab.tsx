"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, AlertTriangle, User } from "lucide-react"

interface FamilyMember {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
}

interface FamilyTabProps {
    planId: string;
}

export function FamilyTab({ planId }: FamilyTabProps) {
    const [contacts, setContacts] = useState<FamilyMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!planId) return;

        const fetchContacts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/plans/${planId}/contacts`);
                if (!response.ok) {
                    throw new Error("Failed to fetch plan contacts");
                }
                const data = await response.json();
                setContacts(data);
            } catch (err: any) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContacts();
    }, [planId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center p-8 text-destructive">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="font-semibold mb-4">Family Members in this Plan</h3>
            {contacts.length === 0 ? (
                <p className="text-muted-foreground">No family members have been added to this plan yet.</p>
            ) : (
                <ul className="space-y-3">
                    {contacts.map((contact) => (
                        <li key={contact.id} className="flex items-center p-3 bg-muted rounded-md">
                            <User className="h-5 w-5 mr-3 text-muted-foreground" />
                            <div className="flex-grow">
                                <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                                <p className="text-sm text-muted-foreground">{contact.role}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {/* TODO: Add UI for selecting/deselecting family members and adding pets */}
        </div>
    );
}
