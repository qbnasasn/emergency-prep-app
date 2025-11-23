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
        // Only items with calories defined
        const calorieRes = await client.query(
            "SELECT SUM(COALESCE(calories, 0) * quantity) as total_calories FROM inventory_items WHERE user_id = $1",
            [userId]
        )
        const totalCalories = parseInt(calorieRes.rows[0].total_calories || "0")

        // 3. Get Food Inventory Analysis
        // Group by nutrition_type (or map from categories if nutrition_type is null but category is food?)
        // The user specifically asked for "categories under the food inventory analysis" which we map to nutrition_type
        // We will fetch all food items and aggregate in JS or SQL. SQL is better.
        // We need to match the NUTRITION_TYPES.

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
            if (row.nutrition_type) {
                analysisMap.set(row.nutrition_type, {
                    items: parseInt(row.items),
                    calories: parseInt(row.calories)
                })
            }
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

        return {
            familyMembers,
            totalCalories,
            foodAnalysis: categories
        }

    } finally {
        client.release()
    }
  } catch (error) {
    console.error("Failed to fetch food page data:", error)
    return {
        familyMembers: [],
        totalCalories: 0,
        foodAnalysis: []
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
