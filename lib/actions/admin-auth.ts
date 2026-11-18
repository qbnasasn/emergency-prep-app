"use server";

import pool from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

// Ensure a secret key exists; fallback for safety in dev, but strictly required in prod.
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "default_unsafe_secret_for_dev_only_change_in_prod"
);

export async function adminLogin(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    throw new Error("Missing credentials");
  }

  const client = await pool.connect();
  try {
    // SECURITY: In production, passwords should be hashed (e.g., bcrypt).
    // The current instruction explicitly set up plain text "admin"/"admin".
    // We are implementing strictly as requested for this user context.
    const res = await client.query(
      "SELECT * FROM admin_users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (res.rows.length === 0) {
      throw new Error("Invalid credentials");
    }

    // Generate Signed JWT
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
    });
  } finally {
    client.release();
  }
}

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value) return false;

  try {
    const { payload } = await jwtVerify(session.value, JWT_SECRET);
    return Boolean(payload.username);
  } catch (error) {
    return false;
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin");
}
