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
  console.log(`[sendNotification] Starting notification process for user ${userId}, type ${type}`);

  try {
    const client = await pool.connect();
    try {
      // 1. Fetch user's settings and email first
      const settingsRes = await client.query('SELECT * FROM notification_settings WHERE user_id = $1', [userId]);
      const userRes = await client.query('SELECT email FROM users WHERE id = $1', [userId]);

      const settings = settingsRes.rows[0];
      const email = userRes.rows[0]?.email;

      // If we have no settings for the user, we can't proceed.
      if (!settings) {
        console.log(`[sendNotification] No notification settings found for user ${userId}. Aborting.`);
        return;
      }

      console.log(`[sendNotification] User settings for ${userId}:`, settings);

      let shouldSendInApp = settings.in_app_alerts;
      let shouldSendEmail = settings.email_alerts;

      // 2. Check category-specific toggles
      // If the master toggle is on, check the specific category toggle.
      // If the category is off, we don't send that type of alert.
      switch (type) {
        case 'weather':
          if (!settings.weather_alerts) { shouldSendInApp = false; shouldSendEmail = false; }
          break;
        case 'inventory':
          if (!settings.inventory_alerts) { shouldSendInApp = false; shouldSendEmail = false; }
          break;
        case 'plan':
          if (!settings.plan_reminders) { shouldSendInApp = false; shouldSendEmail = false; }
          break;
        case 'shopping':
          if (!settings.shopping_updates) { shouldSendInApp = false; shouldSendEmail = false; }
          break;
        case 'system':
          // System messages are always sent if the master toggles are on.
          break;
      }

      // 3. Create In-App Notification if required
      if (shouldSendInApp) {
        console.log(`[sendNotification] Creating in-app notification for user ${userId}`);
        const insertResult = await client.query(
          'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [userId, title, message, type, link]
        );
        console.log('[sendNotification] In-app notification created:', insertResult.rows[0]);
      } else {
        console.log(`[sendNotification] In-app notification skipped for user ${userId} based on settings.`);
      }

      // 4. Send Email Notification if required
      if (shouldSendEmail && email) {
        console.log(`[sendNotification] Sending email notification to ${email}`);
        await resend.emails.send({
          from: 'alerts@prepsafe.app',
          to: email,
          subject: `PrepSafe Alert: ${title}`,
          html: `<p>${message}</p>`
        });
        console.log(`[sendNotification] Email sent successfully to ${email}`);
      } else {
        console.log(`[sendNotification] Email notification skipped for user ${userId} based on settings or missing email.`);
      }

    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`[sendNotification] A critical error occurred for user ${userId}:`, error);
  }
}
