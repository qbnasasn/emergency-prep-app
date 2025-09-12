"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmergencyPlan } from "./plans-list"

const hazardTypes = [
  "Severe Weather", "Earthquake", "Wildfire", "Flood", "Hurricane", "Tornado",
  "Winter Storm", "Power Outage", "Chemical Spill", "Terrorism", "Pandemic", "Cyber Attack",
]

interface PlanBuilderProps {
  plan?: EmergencyPlan | null
  onSave: (plan: EmergencyPlan) => void
  onCancel: () => void
}

export function PlanBuilder({ plan, onSave, onCancel }: PlanBuilderProps) {
  const [planName, setPlanName] = useState("")
  const [description, setDescription] = useState("")
  const [hazardType, setHazardType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    if (plan) {
      setPlanName(plan.name)
      setDescription(plan.description || "")
      setHazardType(plan.hazard_type)
    } else {
      setPlanName(""); setDescription(""); setHazardType("")
    }
  }, [plan])

  const handleSavePlan = async () => {
    setIsLoading(true)
    setError(null)
    if (!planName || !hazardType) {
      toast.error("Plan Name and Hazard Type are required.")
      setIsLoading(false)
      return
    }

    let submissionData: any = {
      name: planName,
      description: description,
      hazard_type: hazardType,
    };

    let url = "/api/plans";
    let method = "POST";

    if (plan) {
      // Editing an existing plan
      url = `/api/plans/${plan.id}`;
      method = "PUT";
      // Note: We are not sending is_active, so it won't be changed by this operation.
      // The PUT handler in the API needs to be updated to not require it.
    } else {
      // Creating a new plan, it's a draft by default
      submissionData.is_active = false;
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${plan ? 'update' : 'save'} plan`)
      }

      const savedPlan = await response.json()
      toast.success(`Plan '${savedPlan.name}' ${plan ? 'updated' : 'saved'} successfully!`)
      onSave(savedPlan)
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="locations" disabled>Locations</TabsTrigger>
          <TabsTrigger value="family" disabled>Family</TabsTrigger>
          <TabsTrigger value="inventory" disabled>Inventory</TabsTrigger>
          <TabsTrigger value="routes" disabled>Routes</TabsTrigger>
          <TabsTrigger value="contacts" disabled>Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardContent className="space-y-6 pt-6">
              {error && <p className="text-red-500">{error}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="plan-name" className="font-body font-medium">Plan Name</Label>
                  <Input id="plan-name" placeholder="Enter plan name" value={planName} onChange={(e) => setPlanName(e.target.value)} className="font-body" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hazard-type" className="font-body font-medium">Hazard Type</Label>
                  <Select value={hazardType} onValueChange={setHazardType}>
                    <SelectTrigger className="font-body"><SelectValue placeholder="Select hazard type" /></SelectTrigger>
                    <SelectContent>
                      {hazardTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, "-")}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-body font-medium">Plan Description</Label>
                <Textarea id="description" placeholder="Describe the purpose and scope of this emergency plan" className="font-body" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder content for other tabs */}
        <TabsContent value="locations"><p className="text-center p-4 text-muted-foreground">Locations management coming soon.</p></TabsContent>
        <TabsContent value="family"><p className="text-center p-4 text-muted-foreground">Family & Pets management coming soon.</p></TabsContent>
        <TabsContent value="inventory"><p className="text-center p-4 text-muted-foreground">Inventory management coming soon.</p></TabsContent>
        <TabsContent value="routes"><p className="text-center p-4 text-muted-foreground">Routes management coming soon.</p></TabsContent>
        <TabsContent value="contacts"><p className="text-center p-4 text-muted-foreground">Contacts management coming soon.</p></TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleSavePlan} disabled={isLoading}>Save</Button>
      </div>
    </div>
  )
}
