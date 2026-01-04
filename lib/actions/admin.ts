"use server";

import { getAuthUser } from "@/lib/auth";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = "admin@prepsafe.app";

async function verifyAdmin() {
  const user = await getAuthUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Admin access required.");
  }
  return user;
}

export async function getAnnouncements() {
  await verifyAdmin();
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT * FROM admin_announcements ORDER BY created_at DESC"
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  imageUrl: string;
  targetLink: string;
}) {
  await verifyAdmin();
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO admin_announcements (title, content, image_url, target_link) VALUES ($1, $2, $3, $4)",
      [data.title, data.content, data.imageUrl, data.targetLink]
    );
    revalidatePath("/dashboard/admin");
  } finally {
    client.release();
  }
}

export async function deleteAnnouncement(id: string) {
  await verifyAdmin();
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM admin_announcements WHERE id = $1", [id]);
    revalidatePath("/dashboard/admin");
  } finally {
    client.release();
  }
}

export async function getVideos() {
  await verifyAdmin();
  const client = await pool.connect();
  try {
    const res = await client.query(
      "SELECT * FROM admin_videos ORDER BY created_at DESC"
    );
    return res.rows;
  } finally {
    client.release();
  }
}

export async function addVideo(youtubeId: string) {
  await verifyAdmin();
  const client = await pool.connect();
  try {
    await client.query(
      "INSERT INTO admin_videos (youtube_id) VALUES ($1)",
      [youtubeId]
    );
    revalidatePath("/dashboard/admin");
  } finally {
    client.release();
  }
}

export async function deleteVideo(id: string) {
  await verifyAdmin();
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM admin_videos WHERE id = $1", [id]);
    revalidatePath("/dashboard/admin");
  } finally {
    client.release();
  }
}

export async function getSocialLinks() {
  await verifyAdmin();
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM admin_settings WHERE key IN ('social_instagram', 'social_reddit')");
    const settings = res.rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {} as Record<string, string>);
    return settings;
  } finally {
    client.release();
  }
}

export async function updateSocialLink(platform: 'instagram' | 'reddit', url: string) {
  await verifyAdmin();
  const client = await pool.connect();
  const key = `social_${platform}`;
  try {
    await client.query(
      `INSERT INTO admin_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key)
       DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, url]
    );
    revalidatePath("/dashboard/admin");
  } finally {
    client.release();
  }
}
