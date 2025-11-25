import { Resend } from 'resend';
import pool from '@/lib/db';
import { EmailTemplate } from '@/components/email-template';

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

    // Default to false if no settings exist.
    // If settings exist, check specific flags.
    if (email && settings) {
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
    } else {
        console.log(`No notification settings found for user ${userId}. Skipping email.`);
    }

    // 3. Send Email via Resend using React Template
    if (shouldEmail && email) {
      console.log(`Sending email to ${email} for ${type} alert`);

      try {
        const { data, error } = await resend.emails.send({
          from: 'PrepSafe Alerts <alerts@prepsafe.app>',
          to: [email],
          subject: `PrepSafe Alert: ${title}`,
          react: EmailTemplate({ title, message, link }),
        });

        if (error) {
          console.error('Resend API returned error:', error);
        } else {
          console.log('Email sent successfully:', data);
        }

      } catch (emailError) {
        console.error('Failed to send email via Resend:', emailError);
      }
    } else {
        console.log(`Skipping email for ${type} alert (Enabled: ${shouldEmail}, Email: ${email ? 'Found' : 'Missing'})`);
    }

  } catch (error) {
    console.error('Error in sendNotification:', error);
  }
}
