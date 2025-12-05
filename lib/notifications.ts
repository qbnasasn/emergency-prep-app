import { Resend } from 'resend';
import pool from '@/lib/db';

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
    // 1. Fetch user settings and email
    const client = await pool.connect();
    try {
      const settingsRes = await client.query(
        'SELECT * FROM notification_settings WHERE user_id = $1',
        [userId]
      );
      const userRes = await client.query('SELECT email FROM users WHERE id = $1', [userId]);

      settings = settingsRes.rows[0];
      email = userRes.rows[0]?.email;

      // Determine delivery methods
      let shouldInApp = false;
      let shouldEmail = false;

      if (settings) {
        let settingVal = 'none';

        switch (type) {
          case 'inventory':
            settingVal = settings.inventory_alerts;
            break;
          case 'weather':
            settingVal = settings.weather_alerts;
            break;
          case 'plan':
            settingVal = settings.plan_reminders;
            break;
          // Shopping alerts removed as per requirements
          case 'system':
            // System alerts (tests) bypass settings
            shouldInApp = true;
            shouldEmail = true;
            break;
        }

        // Apply granular logic for non-system types
        if (type !== 'system') {
            settingVal = settingVal || 'none'; // Safety fallback

            shouldInApp = settingVal === 'in_app' || settingVal === 'both';

            // Email requires specific enablement AND global email_alerts switch
            shouldEmail = (settingVal === 'email' || settingVal === 'both') && settings.email_alerts;
        }
      }

      // 2. Always insert into notifications table (In-App) for history and throttling
      // If In-App is disabled (e.g. Email Only), mark as read so it doesn't trigger a badge
      const isRead = !shouldInApp;
      await client.query(
        'INSERT INTO notifications (user_id, title, message, type, link, read) VALUES ($1, $2, $3, $4, $5, $6)',
        [userId, title, message, type, link, isRead]
      );

      // 3. Send Email via Resend if enabled
      if (shouldEmail && email) {
        console.log(`Sending email to ${email} for ${type} alert`);

        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          console.warn('RESEND_API_KEY is not set. Skipping email sending.');
          return; // Early return to avoid Resend crash
        }

        const resend = new Resend(apiKey);

        const isTestEmail = type === 'system';
        const subject = isTestEmail ? 'PrepSafe Test Notification' : `PrepSafe Alert: ${title}`;
        const htmlContent = isTestEmail
          ? `
              <div style="font-family: sans-serif; color: #333;">
                <h1>PrepSafe Test Email</h1>
                <p>This is a test email to confirm that your notification settings are working correctly.</p>
                <p>You can safely ignore this email.</p>
                <hr />
                <p style="font-size: 12px; color: #666;">
                  <a href="https://prepsafe.app/dashboard/settings">Manage Settings</a>
                </p>
              </div>
            `
          : `
              <div style="font-family: sans-serif; color: #333;">
                <h1>${title}</h1>
                <p>${message}</p>
                <hr />
                <p style="font-size: 12px; color: #666;">
                  You are receiving this email because you have enabled notifications for PrepSafe.
                  <a href="https://prepsafe.app/dashboard/settings">Manage Settings</a>
                </p>
              </div>
            `;

        try {
          await resend.emails.send({
            from: 'alerts@prepsafe.app',
            to: email,
            subject: subject,
            html: htmlContent,
          });
        } catch (emailError) {
          console.error('Failed to send email via Resend:', emailError);
        }
      }

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error in sendNotification:', error);
  }
}
