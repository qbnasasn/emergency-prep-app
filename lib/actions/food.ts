"use server"

import pool from "@/lib/db"
import { auth } from "@/lib/auth"
import { NUTRITION_TYPES } from "@/lib/constants"
import { KnowledgeDocument } from "@/lib/actions/knowledge"

export async function getFoodPageData() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const userId = session.user.id

  try {
    const client = await pool.connect()
    try {
        // 1. Get Family Members
        const familyRes = await client.query(
            "SELECT * FROM family_members WHERE user_id = $1",
            [userId]
        )
        const familyMembers = familyRes.rows

        // 2. Get Inventory Items for Calculation (Total Calories)
        // STRICTLY from 'Food & Nutrition' category to match analysis
        const calorieRes = await client.query(
            "SELECT SUM(COALESCE(calories, 0) * quantity) as total_calories FROM inventory_items WHERE user_id = $1 AND category = 'Food & Nutrition'",
            [userId]
        )
        const totalCalories = parseInt(calorieRes.rows[0].total_calories || "0")

        // 3. Get Food Inventory Analysis
        // Group by nutrition_type
        // Map NULL nutrition_type to "Other"
        const analysisRes = await client.query(
            `SELECT
                nutrition_type,
                COUNT(*) as items,
                SUM(COALESCE(calories, 0) * quantity) as calories
             FROM inventory_items
             WHERE user_id = $1
               AND category = 'Food & Nutrition'
             GROUP BY nutrition_type`,
            [userId]
        )

        // Process analysis results to match the format expected by the component
        const analysisMap = new Map()
        analysisRes.rows.forEach(row => {
            const type = row.nutrition_type || "Other" // Map NULL/Empty to "Other"

            const existing = analysisMap.get(type) || { items: 0, calories: 0 }
            analysisMap.set(type, {
                items: existing.items + parseInt(row.items),
                calories: existing.calories + parseInt(row.calories)
            })
        })

        const categories = NUTRITION_TYPES.map(type => {
            const data = analysisMap.get(type) || { items: 0, calories: 0 }
            const percentage = totalCalories > 0 ? (data.calories / totalCalories) * 100 : 0

            // Simple logic for status
            let status: "good" | "low" | "critical" = "critical"
            if (percentage > 15) status = "good"
            else if (percentage > 5) status = "low"

            return {
                name: type,
                items: data.items,
                calories: data.calories,
                percentage: parseFloat(percentage.toFixed(1)),
                status
            }
        })

        // Calculate stats for overview
        const foodItemsCountRes = await client.query(
            "SELECT COUNT(*) as count FROM inventory_items WHERE user_id = $1 AND category = 'Food & Nutrition'",
            [userId]
        )
        const foodItemsCount = parseInt(foodItemsCountRes.rows[0].count || "0")

        // Estimate days of food (simple calculation: 2000 cal/person/day)
        // This is a rough estimate for the overview, the calculator is more precise.
        // If 0 people, assume 1 for calculation to avoid division by zero or set to 0.
        const peopleCount = familyMembers.length > 0 ? familyMembers.length : 1
        const dailyNeedEstimate = peopleCount * 2000
        const daysOfFood = dailyNeedEstimate > 0 ? totalCalories / dailyNeedEstimate : 0

        return {
            familyMembers,
            totalCalories,
            foodAnalysis: categories,
            stats: {
                daysOfFood,
                totalCalories,
                familyMemberCount: familyMembers.length,
                foodItemsCount
            }
        }

    } finally {
        client.release()
    }
  } catch (error) {
    console.error("Failed to fetch food page data:", error)
    return {
        familyMembers: [],
        totalCalories: 0,
        foodAnalysis: [],
        stats: {
            daysOfFood: 0,
            totalCalories: 0,
            familyMemberCount: 0,
            foodItemsCount: 0
        }
    }
  }
}

export async function getMenus() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const query = `
            SELECT * FROM knowledge_base_docs
            WHERE user_id = $1 AND type = 'menu'
            ORDER BY created_at DESC
        `
        const result = await pool.query(query, [session.user.id])
        return result.rows as KnowledgeDocument[]
    } catch (error) {
        console.error("Failed to fetch menus:", error)
        return []
    }
}
