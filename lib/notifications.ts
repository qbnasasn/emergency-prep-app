import { Resend } from 'resend';
import pool from '@/lib/db';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export type NotificationType = 'weather' | 'inventory' | 'plan' | 'shopping' | 'system';

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  link?: string
) {
  let email: string | undefined;
  let settings: any;

  try {
    // 1. Fetch user settings and email, and insert notification
    const client = await pool.connect();
    try {
      const settingsRes = await client.query(
        'SELECT * FROM notification_settings WHERE user_id = $1',
        [userId]
      );
      const userRes = await client.query('SELECT email FROM users WHERE id = $1', [userId]);

      settings = settingsRes.rows[0];
      email = userRes.rows[0]?.email;

      // Insert into notifications table (for the in-app bell)
      // This is always done so the user sees it in the dashboard
      await client.query(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES ($1, $2, $3, $4, $5)',
        [userId, title, message, type, link]
      );
    } finally {
      client.release(); // Release connection BEFORE external API call
    }

    // 2. Check if email should be sent
    let shouldEmail = false;

    // Only send if user exists, has email, and has settings
    if (email && settings) {
      // Must have global email_alerts enabled
      if (settings.email_alerts) {
        // Check specific category
        switch (type) {
          case 'weather':
            if (settings.weather_alerts) shouldEmail = true;
            break;
          case 'inventory':
            if (settings.inventory_alerts) shouldEmail = true;
            break;
          case 'plan':
            if (settings.plan_reminders) shouldEmail = true;
            break;
          case 'shopping':
            if (settings.shopping_updates) shouldEmail = true;
            break;
          case 'system':
            shouldEmail = true;
            break;
        }
      }
    }

    // 3. Send Email via Resend
    if (shouldEmail && email) {
      console.log(`Sending email to ${email} for ${type} alert`);
      const actionLink = link ? `<p><a href="https://prepsafe.app${link}">View Details</a></p>` : '';

      try {
        await resend.emails.send({
          from: 'alerts@prepsafe.app',
          to: email,
          subject: `PrepSafe Alert: ${title}`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h1>${title}</h1>
              <p>${message}</p>
              ${actionLink}
              <hr />
              <p style="font-size: 12px; color: #666;">
                You are receiving this email because you have enabled notifications for PrepSafe.
                <a href="https://prepsafe.app/dashboard/settings">Manage Settings</a>
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
      }
    }

  } catch (error) {
    console.error('Error in sendNotification:', error);
  }
}
