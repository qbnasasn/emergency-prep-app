"use server"

import { revalidatePath } from "next/cache"
import pool from "@/lib/db"
import { z } from "zod"
import { getAuthUser } from "@/lib/auth"

const MAX_DOCS_SCOUT = 5;

// Schema for Knowledge Base Document
const DocumentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  type: z.enum(["article", "guide", "tip", "menu"]),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean().default(false),
})

export type KnowledgeDocument = z.infer<typeof DocumentSchema> & {
  id: string
  user_id: string | null
  created_at: Date
  updated_at: Date
  is_favorite?: boolean
}

// Get all documents (System + User's private) with optional filtering
export async function getDocuments(filters?: {
  type?: string
  category?: string
  search?: string
}) {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const userId = user.id
  let query = `
    SELECT
      d.*,
      EXISTS(SELECT 1 FROM kb_favorites f WHERE f.doc_id = d.id AND f.user_id = $1) as is_favorite
    FROM knowledge_base_docs d
    WHERE d.user_id = $1
  `
  const params: any[] = [userId]
  let paramIndex = 2

  if (filters?.type && filters.type !== "all") {
    query += ` AND d.type = $${paramIndex}`
    params.push(filters.type)
    paramIndex++
  }

  if (filters?.category && filters.category !== "all") {
    query += ` AND d.category = $${paramIndex}`
    params.push(filters.category)
    paramIndex++
  }

  if (filters?.search) {
    query += ` AND (d.title ILIKE $${paramIndex} OR d.content ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  query += ` ORDER BY d.created_at DESC`

  try {
    const result = await pool.query(query, params)
    return result.rows as KnowledgeDocument[]
  } catch (error) {
    console.error("Failed to fetch documents:", error)
    return []
  }
}

// Get a single document by ID
export async function getDocument(id: string) {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    const result = await pool.query(
      `
      SELECT
        d.*,
        EXISTS(SELECT 1 FROM kb_favorites f WHERE f.doc_id = d.id AND f.user_id = $2) as is_favorite
      FROM knowledge_base_docs d
      WHERE d.id = $1 AND d.user_id = $2
      `,
      [id, user.id]
    )
    return result.rows[0] as KnowledgeDocument | null
  } catch (error) {
    console.error("Failed to fetch document:", error)
    return null
  }
}

// Create a new document
export async function createDocument(data: z.infer<typeof DocumentSchema>) {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const householdId = user.householdId
  const subscriptionPlan = user.subscriptionPlan

  const validatedFields = DocumentSchema.safeParse(data)
  if (!validatedFields.success) {
    throw new Error("Invalid fields")
  }

  const { title, content, type, category, tags } = validatedFields.data

  try {
    // Enforce Scout Plan Limit
    if (subscriptionPlan === 'scout') {
        if (!householdId) return { success: false, error: "Household context missing" };

        const countResult = await pool.query(
            `SELECT COUNT(k.*)
             FROM knowledge_base_docs k
             JOIN users u ON k.user_id = u.id
             WHERE u.household_id = $1 AND k.user_id IS NOT NULL`,
            [householdId]
        );
        const count = parseInt(countResult.rows[0].count, 10);

        if (count >= MAX_DOCS_SCOUT) {
            return { success: false, error: 'Scout plan limited to 5 custom documents.' };
        }
    }

    const result = await pool.query(
      `
      INSERT INTO knowledge_base_docs (user_id, title, content, type, category, tags, is_public)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [
        user.id,
        title,
        content || "",
        type,
        category || "general",
        tags || [],
        false, // User created docs are private by default
      ]
    )
    revalidatePath("/dashboard/knowledge")
    return { success: true, id: result.rows[0].id }
  } catch (error) {
    console.error("Failed to create document:", error)
    return { success: false, error: "Failed to create document" }
  }
}

// Update a document
export async function updateDocument(id: string, data: z.infer<typeof DocumentSchema>) {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const validatedFields = DocumentSchema.safeParse(data)
  if (!validatedFields.success) {
    throw new Error("Invalid fields")
  }

  const { title, content, type, category, tags } = validatedFields.data

  try {
    // Check ownership
    const check = await pool.query(
      "SELECT user_id FROM knowledge_base_docs WHERE id = $1",
      [id]
    )
    if (check.rows.length === 0) return { success: false, error: "Document not found" }
    if (check.rows[0].user_id !== user.id) {
      return { success: false, error: "Not authorized to update this document" }
    }

    await pool.query(
      `
      UPDATE knowledge_base_docs
      SET title = $1, content = $2, type = $3, category = $4, tags = $5, updated_at = now()
      WHERE id = $6
      `,
      [title, content || "", type, category || "general", tags || [], id]
    )
    revalidatePath("/dashboard/knowledge")
    return { success: true }
  } catch (error) {
    console.error("Failed to update document:", error)
    return { success: false, error: "Failed to update document" }
  }
}

// Delete a document
export async function deleteDocument(id: string) {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
     // Check ownership
     const check = await pool.query(
      "SELECT user_id FROM knowledge_base_docs WHERE id = $1",
      [id]
    )
    if (check.rows.length === 0) return { success: false, error: "Document not found" }
    if (check.rows[0].user_id !== user.id) {
      return { success: false, error: "Not authorized to delete this document" }
    }

    await pool.query("DELETE FROM knowledge_base_docs WHERE id = $1", [id])
    revalidatePath("/dashboard/knowledge")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete document:", error)
    return { success: false, error: "Failed to delete document" }
  }
}

// Toggle Favorite
export async function toggleFavorite(docId: string) {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    const existing = await pool.query(
      "SELECT 1 FROM kb_favorites WHERE user_id = $1 AND doc_id = $2",
      [user.id, docId]
    )

    if (existing.rows.length > 0) {
      await pool.query(
        "DELETE FROM kb_favorites WHERE user_id = $1 AND doc_id = $2",
        [user.id, docId]
      )
    } else {
      await pool.query(
        "INSERT INTO kb_favorites (user_id, doc_id) VALUES ($1, $2)",
        [user.id, docId]
      )
    }
    revalidatePath("/dashboard/knowledge")
    return { success: true }
  } catch (error) {
    console.error("Failed to toggle favorite:", error)
    return { success: false, error: "Failed to toggle favorite" }
  }
}

// Get Daily Tip for Dashboard
export async function getDailyTip() {
  const user = await getAuthUser()
  const userId = user?.id

  try {
    // Set seed based on the day of the year (0.0 to 1.0)
    // We use a transaction to set the seed locally for this query
    const client = await pool.connect()
    try {
        await client.query("BEGIN")
        await client.query("SELECT setseed(extract(doy from current_date) / 366.0)")

        // Fetch tips that belong to the user (since we seed them)
        // If no user (public dashboard?), we might fallback to system tips if we kept them,
        // but for now we assume authenticated dashboard.
        const query = "SELECT * FROM knowledge_base_docs WHERE type = 'tip' AND user_id = $1 ORDER BY RANDOM() LIMIT 1"

        const params = [userId]
        const result = await client.query(query, params)

        await client.query("COMMIT")
        return result.rows[0] as KnowledgeDocument | null
    } catch (e) {
        await client.query("ROLLBACK")
        throw e
    } finally {
        client.release()
    }
  } catch (error) {
    console.error("Failed to get daily tip:", error)
    return null
  }
}

// Get Favorites
export async function getFavorites() {
  const user = await getAuthUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  try {
    const result = await pool.query(
      `
      SELECT d.*, true as is_favorite
      FROM knowledge_base_docs d
      JOIN kb_favorites f ON d.id = f.doc_id
      WHERE f.user_id = $1
      ORDER BY d.created_at DESC
      `,
      [user.id]
    )
    return result.rows as KnowledgeDocument[]
  } catch (error) {
    console.error("Failed to get favorites:", error)
    return []
  }
}
