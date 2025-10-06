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
    if (gps_location) {
      const [latitude, longitude] = gps_location.split(',').map(s => parseFloat(s.trim()));
      if (isNaN(latitude) || isNaN(longitude)) throw new Error("Invalid GPS coordinates.");
      kitResult = await client.query(
        `INSERT INTO kits (user_id, name, description, category, gps_location) VALUES ($1, $2, $3, $4, POINT($5, $6)) RETURNING id;`,
        [userId, name, description, category, latitude, longitude]
      );
    } else {
      kitResult = await client.query(
        `INSERT INTO kits (user_id, name, description, category) VALUES ($1, $2, $3, $4) RETURNING id;`,
        [userId, name, description, category]
      );
    }

    const newKitId = kitResult.rows[0]?.id;
    if (!newKitId) throw new Error("Failed to create kit.");

    await Promise.all(items.map(item => client.query(
      `INSERT INTO kit_items (kit_id, item_id, quantity) VALUES ($1, $2, $3);`,
      [newKitId, item.id, item.quantity]
    )));

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating kit:", error);
    return { success: false, message: "A database error occurred. Could not create kit." };
  } finally {
    client.release();
  }

  revalidatePath("/dashboard/kits");
  return { success: true };
}

export async function updateKit(kitId: string, kitData: Omit<KitData, 'items'> & { items: any[] }) {
    const { name, description, category, gps_location, items } = kitData;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        if (gps_location) {
            const [latitude, longitude] = gps_location.split(',').map(s => parseFloat(s.trim()));
            if (isNaN(latitude) || isNaN(longitude)) throw new Error("Invalid GPS coordinates.");
            await client.query(
                `UPDATE kits SET name = $1, description = $2, category = $3, gps_location = POINT($4, $5) WHERE id = $6;`,
                [name, description, category, latitude, longitude, kitId]
            );
        } else {
            await client.query(
                `UPDATE kits SET name = $1, description = $2, category = $3, gps_location = NULL WHERE id = $4;`,
                [name, description, category, kitId]
            );
        }

        await client.query(`DELETE FROM kit_items WHERE kit_id = $1;`, [kitId]);

        await Promise.all(items.map(item => client.query(
            `INSERT INTO kit_items (kit_id, item_id, quantity) VALUES ($1, $2, $3);`,
            [kitId, item.id, item.quantity]
        )));

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating kit:", error);
        return { success: false, message: "A database error occurred. Could not update kit." };
    } finally {
        client.release();
    }

    revalidatePath("/dashboard/kits");
    return { success: true };
}

export async function deleteKit(kitId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM kit_items WHERE kit_id = $1;`, [kitId]);
    await client.query(`DELETE FROM kits WHERE id = $1;`, [kitId]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error deleting kit:", error);
    return { success: false, message: "A database error occurred. Could not delete kit." };
  } finally {
    client.release();
  }

  revalidatePath("/dashboard/kits");
  return { success: true };
}