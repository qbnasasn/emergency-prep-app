"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmergencyPlan } from "./plans-list" // Assuming EmergencyPlan is exported from plans-list

const hazardTypes = [
  "Severe Weather",
  "Earthquake",
  "Wildfire",
  "Flood",
  "Hurricane",
  "Tornado",
  "Winter Storm",
  "Power Outage",
  "Chemical Spill",
  "Terrorism",
  "Pandemic",
  "Cyber Attack",
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

  useEffect(() => {
    if (plan) {
      setPlanName(plan.name)
      setDescription(plan.description || "")
      setHazardType(plan.hazard_type)
    } else {
      // Reset form when there's no plan (for new plan creation)
      setPlanName("")
      setDescription("")
      setHazardType("")
    }
  }, [plan])

  const handleSavePlan = async (isActive: boolean) => {
    setIsLoading(true)
    setError(null)
    if (!planName || !hazardType) {
      toast.error("Plan Name and Hazard Type are required.")
      setIsLoading(false)
      return
    }

    const planData = {
      name: planName,
      description: description,
      hazard_type: hazardType,
      is_active: isActive,
    }

    try {
      const url = plan ? `/api/plans/${plan.id}` : "/api/plans"
      const method = plan ? "PUT" : "POST"

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">{plan ? 'Edit Plan' : 'Create a New Plan'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <p className="text-red-500">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="plan-name" className="font-body font-medium">
                Plan Name
              </Label>
              <Input
                id="plan-name"
                placeholder="Enter plan name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                className="font-body"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hazard-type" className="font-body font-medium">
                Hazard Type
              </Label>
              <Select value={hazardType} onValueChange={setHazardType}>
                <SelectTrigger className="font-body">
                  <SelectValue placeholder="Select hazard type" />
                </SelectTrigger>
                <SelectContent>
                  {hazardTypes.map((type) => (
                    <SelectItem key={type} value={type.toLowerCase().replace(/\s+/g, "-")}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-body font-medium">
              Plan Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose and scope of this emergency plan"
              className="font-body"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
        </Button>
        <Button onClick={() => handleSavePlan(false)} disabled={isLoading}>
            Save Draft
        </Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => handleSavePlan(true)} disabled={isLoading}>
            Save and Activate
        </Button>
      </div>
    </div>
  )
}
