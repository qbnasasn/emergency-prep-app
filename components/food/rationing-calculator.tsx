"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Users, Calendar } from "lucide-react"

interface FamilyMember {
  id: string
  first_name: string
  birth_date: string | null
  weight_lbs: number | null
  height_inches: number | null
  // We might not have these in DB, so we handle defaults or calculate
}

interface RationingCalculatorProps {
    initialFamilyMembers: any[]
    initialTotalCalories: number
}

export function RationingCalculator({ initialFamilyMembers, initialTotalCalories }: RationingCalculatorProps) {
  const [familyMembers, setFamilyMembers] = useState<any[]>(initialFamilyMembers)
  const [totalCaloriesAvailable, setTotalCaloriesAvailable] = useState(initialTotalCalories)
  const [rationingLevel, setRationingLevel] = useState("normal")
  const [calculatedDays, setCalculatedDays] = useState(0)
  const [dailyCaloriesNeeded, setDailyCaloriesNeeded] = useState(0)

  // Helper to calculate age from birthdate
  const calculateAge = (birthDate: string | null) => {
      if (!birthDate) return 30; // Default
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
      }
      return age;
  }

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = (member: any) => {
    const weight = member.weight_lbs || 150
    const height = member.height_inches || 68
    const age = calculateAge(member.birth_date)
    // Default to Male logic if unknown, or try to infer. For now, we don't have gender in DB, assume mix or average.
    // Let's just use Male formula as base or a simplified average.
    // Or adds UI to select gender/activity?
    // Since we can't edit DB here easily, let's use a standard assumption or client-side only override.
    // For this implementation, I'll use a simplified average BMR if gender unknown.
    // Actually, user wants to "pull family info".
    // I'll assume Male for calculation to be safe (higher calorie need).

    const weightKg = weight * 0.453592
    const heightCm = height * 2.54

    // Male formula: 10W + 6.25H - 5A + 5
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (member: any) => {
    const bmr = calculateBMR(member)
    // Default to moderate if not set
    const activityLevel = member.activityLevel || "moderate"
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    }
    return bmr * (activityMultipliers[activityLevel] || 1.55)
  }

  // Calculate rationing multiplier
  const getRationingMultiplier = (level: string) => {
    switch (level) {
      case "survival":
        return 0.6 // 60% of normal calories
      case "reduced":
        return 0.8 // 80% of normal calories
      case "normal":
        return 1.0 // 100% of normal calories
      default:
        return 1.0
    }
  }

  useEffect(() => {
    const totalDailyCalories = familyMembers.reduce((total, member) => {
      return total + calculateTDEE(member)
    }, 0)

    const rationingMultiplier = getRationingMultiplier(rationingLevel)
    const adjustedDailyCalories = totalDailyCalories * rationingMultiplier

    setDailyCaloriesNeeded(Math.round(adjustedDailyCalories))
    if (adjustedDailyCalories > 0) {
        setCalculatedDays(Math.floor(totalCaloriesAvailable / adjustedDailyCalories))
    } else {
        setCalculatedDays(0)
    }
  }, [familyMembers, totalCaloriesAvailable, rationingLevel])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-primary" />
          Rationing Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-body font-medium">Total Calories Available</Label>
            <Input
              type="number"
              value={totalCaloriesAvailable}
              onChange={(e) => setTotalCaloriesAvailable(Number(e.target.value))}
              className="font-body"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body font-medium">Rationing Level</Label>
            <Select value={rationingLevel} onValueChange={setRationingLevel}>
              <SelectTrigger className="font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (100%)</SelectItem>
                <SelectItem value="reduced">Reduced (80%)</SelectItem>
                <SelectItem value="survival">Survival (60%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-body font-semibold text-foreground flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Family Members ({familyMembers.length})
          </h3>
          <div className="space-y-3">
            {familyMembers.length === 0 ? (
                <div className="text-sm text-muted-foreground">No family members found in settings.</div>
            ) : (
                familyMembers.map((member) => (
                <div key={member.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                    <div>
                        <div className="font-body font-medium text-foreground">{member.first_name || "Unknown"}</div>
                        <div className="font-body text-sm text-muted-foreground">
                        {calculateAge(member.birth_date)} years, {member.weight_lbs || "?"} lbs
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-body font-medium text-foreground">
                        ~{Math.round(calculateTDEE(member))} cal/day
                        </div>
                        <div className="font-body text-xs text-muted-foreground capitalize">
                            Moderate (Est.)
                        </div>
                    </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-primary/10 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-heading font-bold text-blue-900">{calculatedDays}</div>
              <div className="font-body text-sm text-blue-700 flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-1" />
                Days of Food
              </div>
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-blue-900">
                {dailyCaloriesNeeded.toLocaleString()}
              </div>
              <div className="font-body text-sm text-blue-700">Calories/Day Needed</div>
            </div>
            <div>
              <div className="text-2xl font-heading font-bold text-blue-900">{familyMembers.length}</div>
              <div className="font-body text-sm text-blue-700 flex items-center justify-center">
                <Users className="h-4 w-4 mr-1" />
                People Fed
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-primary/10 rounded-lg">
          <p className="font-body text-sm text-orange-800">
            <strong>Rationing Recommendations:</strong>
            <br />• Normal: Maintain regular caloric intake for optimal health
            <br />• Reduced: Short-term rationing for extending supplies
            <br />• Survival: Emergency rationing - monitor health closely
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
