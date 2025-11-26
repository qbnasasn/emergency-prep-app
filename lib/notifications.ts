import { Resend } from 'resend';
import pool from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY);

export type NotificationType = 'weather' | 'inventory' | 'plan' | 'shopping' | 'system';

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  link?: string
) {
  console.log(`[Notification] Starting: User ${userId}, Type: ${type}, Title: ${title}`);

  let settings;
  let email;
  const client = await pool.connect();

  try {
    // Step 1: Fetch Settings
    try {
      const settingsRes = await client.query('SELECT * FROM notification_settings WHERE user_id = $1', [userId]);
      settings = settingsRes.rows[0];
      if (!settings) {
        console.log(`[Notification] No settings found for user ${userId}. Using default settings.`);
        settings = {
          in_app_alerts: true, email_alerts: false, weather_alerts: true,
          inventory_alerts: true, plan_reminders: true, shopping_updates: true
        };
      }
    } catch (error) {
      console.error(`[Notification] CRITICAL: Failed to fetch settings for user ${userId}.`, error);
      return; // Abort if we can't get settings
    }

    // Step 2: Determine Actions
    let shouldSendInApp = settings.in_app_alerts;
    let shouldSendEmail = settings.email_alerts;

    switch (type) {
      case 'inventory': if (!settings.inventory_alerts) { shouldSendInApp = false; shouldSendEmail = false; } break;
      // ... other cases
    }

    // Step 3: Create In-App Notification
    if (shouldSendInApp) {
      try {
        await client.query(
          'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
          [userId, title, message, type, link]
        );
        console.log(`[Notification] SUCCESS: In-app notification created for user ${userId}.`);
      } catch (error) {
        console.error(`[Notification] CRITICAL: Failed to insert in-app notification for user ${userId}.`, error);
      }
    }

    // Step 4: Send Email
    if (shouldSendEmail) {
      try {
        const userRes = await client.query('SELECT email FROM users WHERE id = $1', [userId]);
        email = userRes.rows[0]?.email;
        if (email) {
          await resend.emails.send({ from: 'alerts@prepsafe.app', to: email, subject: title, html: `<p>${message}</p>` });
          console.log(`[Notification] SUCCESS: Email sent to ${email} for user ${userId}.`);
        } else {
          console.error(`[Notification] ERROR: Cannot send email. User ${userId} has no email address.`);
        }
      } catch (error) {
        console.error(`[Notification] CRITICAL: Failed to send email for user ${userId}.`, error);
      }
    }

  } finally {
    client.release();
    console.log(`[Notification] Process Finished: User ${userId}, Type: ${type}`);
  }
}
