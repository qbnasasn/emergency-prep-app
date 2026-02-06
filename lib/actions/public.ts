"use server";

import pool from "@/lib/db";

export async function getPublicSocialLinks() {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM admin_settings WHERE key IN ('social_instagram', 'social_reddit', 'social_slack', 'social_x', 'social_youtube')"
      );
      const settings = res.rows.reduce((acc, row) => {
        acc[row.key] = row.value;
        return acc;
      }, {} as Record<string, string>);
      return settings;
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn("Failed to fetch social links:", error);
    return {};
  }
}

export async function getPublicAnnouncements() {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM admin_announcements ORDER BY created_at DESC"
      );
      return res.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn("Failed to fetch announcements:", error);
    return [];
  }
}
