"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import pool from "@/lib/db"

type KitData = {
  name: string;
  description: string;
  category: string;
  gps_location: string;
  items: { id: string; quantity: number }[];
};

export async function createKit(userId: string, kitData: KitData) {
  const { name, description, category, gps_location, items } = kitData
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let kitResult;
    // Use a parameterized query for the POINT to prevent SQL injection.
    // The gps_location string is expected to be "latitude, longitude".
    if (gps_location) {
      const [latitude, longitude] = gps_location.split(',').map(s => parseFloat(s.trim()));
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid GPS coordinates format. Expected 'latitude, longitude'.");
      }
      kitResult = await client.query(
        `INSERT INTO kits (user_id, name, description, category, gps_location)
         VALUES ($1, $2, $3, $4, POINT($5, $6))
         RETURNING id;`,
        [userId, name, description, category, latitude, longitude]
      );
    } else {
      // Insert without GPS location if it's not provided.
      kitResult = await client.query(
        `INSERT INTO kits (user_id, name, description, category)
         VALUES ($1, $2, $3, $4)
         RETURNING id;`,
        [userId, name, description, category]
      );
    }

    const newKitId = kitResult.rows[0]?.id;

    if (!newKitId) {
      throw new Error("Failed to create kit, no ID was returned.");
    }

    // Insert all associated items into the kit_items table.
    // Using Promise.all to run these queries in parallel for efficiency.
    await Promise.all(items.map(item => {
      return client.query(
        `INSERT INTO kit_items (kit_id, item_id, quantity)
         VALUES ($1, $2, $3);`,
        [newKitId, item.id, item.quantity]
      );
    }));

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating kit:", error);
    // Return a structured error for the client-side to handle.
    return { success: false, message: "A database error occurred. Could not create kit." };
  } finally {
    client.release();
  }

  // On success, revalidate the path to update the cache and then redirect.
  revalidatePath("/dashboard/kits");
  redirect("/dashboard/kits");
}