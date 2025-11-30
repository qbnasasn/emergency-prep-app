"use server"

import pool from "@/lib/db"
import { getAuthUser } from "@/lib/auth"
import { DEFAULT_KNOWLEDGE_DOCS } from "@/lib/data/initial-knowledge"
import { revalidatePath } from "next/cache"

export async function seedUserKnowledgeBase() {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Check if user already has docs (to avoid duplicates or re-seeding)
      // Actually, user might have deleted them, so we should check specifically for these titles?
      // Or just check if count > 0.
      const check = await client.query("SELECT count(*) FROM knowledge_base_docs WHERE user_id = $1", [user.id])
      const count = parseInt(check.rows[0].count)

      if (count === 0) {
        // Bulk insert
        for (const doc of DEFAULT_KNOWLEDGE_DOCS) {
          await client.query(
            `INSERT INTO knowledge_base_docs (user_id, title, content, type, category, is_public)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [user.id, doc.title, doc.content, doc.type, doc.category, false]
          )
        }
        console.log(`Seeded ${DEFAULT_KNOWLEDGE_DOCS.length} documents for user ${user.id}`)
      }

      await client.query("COMMIT")
    } catch (e) {
      await client.query("ROLLBACK")
      throw e
    } finally {
      client.release()
    }

    revalidatePath("/dashboard/knowledge")
    return { success: true }
  } catch (error) {
    console.error("Failed to seed knowledge base:", error)
    return { success: false, error: "Failed to seed knowledge base" }
  }
}
