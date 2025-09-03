"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Users, Calendar } from "lucide-react"

interface FamilyMember {
  id: string
  name: string
  age: number
  weight: number
  height: number
  activityLevel: "sedentary" | "light" | "moderate" | "active"
  gender: "male" | "female"
}

export function RationingCalculator() {
  const [familyMembers] = useState<FamilyMember[]>([
    {
      id: "1",
      name: "John Doe",
      age: 35,
      weight: 180,
      height: 72,
      activityLevel: "moderate",
      gender: "male",
    },
    {
      id: "2",
      name: "Jane Doe",
      age: 32,
      weight: 140,
      height: 66,
      activityLevel: "light",
      gender: "female",
    },
    {
      id: "3",
      name: "Child 1",
      age: 12,
      weight: 90,
      height: 58,
      activityLevel: "active",
      gender: "male",
    },
    {
      id: "4",
      name: "Child 2",
      age: 8,
      weight: 65,
      height: 52,
      activityLevel: "active",
      gender: "female",
    },
  ])

  const [totalCaloriesAvailable, setTotalCaloriesAvailable] = useState(87240)
  const [rationingLevel, setRationingLevel] = useState("normal")
  const [calculatedDays, setCalculatedDays] = useState(0)
  const [dailyCaloriesNeeded, setDailyCaloriesNeeded] = useState(0)

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = (member: FamilyMember) => {
    const { weight, height, age, gender } = member
    const weightKg = weight * 0.453592 // Convert lbs to kg
    const heightCm = height * 2.54 // Convert inches to cm

    if (gender === "male") {
      return 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    } else {
      return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
    }
  }

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (member: FamilyMember) => {
    const bmr = calculateBMR(member)
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    }
    return bmr * activityMultipliers[member.activityLevel]
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
    setCalculatedDays(Math.floor(totalCaloriesAvailable / adjustedDailyCalories))
  }, [familyMembers, totalCaloriesAvailable, rationingLevel])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-blue-500" />
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
            {familyMembers.map((member) => (
              <div key={member.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-body font-medium text-foreground">{member.name}</div>
                    <div className="font-body text-sm text-muted-foreground">
                      {member.age} years, {member.weight} lbs, {Math.floor(member.height / 12)}'{member.height % 12}"
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-body font-medium text-foreground">
                      {Math.round(calculateTDEE(member))} cal/day
                    </div>
                    <div className="font-body text-xs text-muted-foreground capitalize">{member.activityLevel} activity</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
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

        <div className="p-3 bg-orange-50 rounded-lg">
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
