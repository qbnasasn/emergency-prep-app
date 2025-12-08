"use server";

import { getAuthUser } from "@/lib/auth";
import { Resend } from "resend";
import { z } from "zod";

const supportSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
});

type SupportFormData = z.infer<typeof supportSchema>;

export async function submitSupportRequest(data: SupportFormData) {
  try {
    // 1. Validate Input
    const validatedFields = supportSchema.safeParse(data);

    if (!validatedFields.success) {
      return { success: false, error: "Invalid fields", details: validatedFields.error.flatten() };
    }

    const { subject, message, email: inputEmail } = validatedFields.data;

    // 2. Auth Logic
    const user = await getAuthUser();
    let emailToSend: string | undefined;
    let nameToSend: string | undefined;

    if (user) {
      emailToSend = user.email;
      // Use name from user if available, otherwise just email or "Authenticated User"
      // user object from getAuthUser typically has email.
      // Checking lib/auth.ts: it returns { id, email, householdId, subscriptionPlan, ... }
      // It might not have full_name explicitly in the SELECT unless I checked closely.
      // Checking lib/auth.ts memory again...
      // "SELECT id, email, household_id as "householdId", subscription_plan as "subscriptionPlan" FROM users..."
      // It does NOT select full_name. So I'll use email.
      nameToSend = "Authenticated User";
    } else {
      // Guest
      if (!inputEmail || inputEmail.trim() === "") {
        return { success: false, error: "Email is required for guests" };
      }
      emailToSend = inputEmail;
      nameToSend = "Guest User";
    }

    if (!emailToSend) {
        return { success: false, error: "Could not determine email address" };
    }

    // 3. Send Email (Lazy Init)
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is missing");
      return { success: false, error: "Server configuration error" };
    }

    const supportEmail = process.env.SUPPORT_EMAIL;
    if (!supportEmail) {
        console.error("SUPPORT_EMAIL is missing");
        return { success: false, error: "Server configuration error" };
    }

    const resend = new Resend(apiKey);

    // Email to Support
    await resend.emails.send({
      from: "PrepSafe App <app@prepsafe.app>",
      to: supportEmail,
      replyTo: emailToSend,
      subject: `[Support] ${subject}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>New Support Request</h2>
          <p><strong>From:</strong> ${nameToSend} (${emailToSend})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <h3>Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
    });

    // Confirmation Email to User
    await resend.emails.send({
      from: "PrepSafe App <app@prepsafe.app>",
      to: emailToSend,
      subject: `We received your request: ${subject}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Support Request Received</h2>
          <p>Hi,</p>
          <p>We have received your support request regarding "<strong>${subject}</strong>".</p>
          <p>Our team will review it and get back to you shortly.</p>
          <hr />
          <p><strong>Your Message:</strong></p>
          <p style="white-space: pre-wrap; color: #666;">${message}</p>
        </div>
      `,
    });

    return { success: true };

  } catch (error) {
    console.error("Error submitting support request:", error);
    return { success: false, error: "Failed to send message. Please try again later." };
  }
}
