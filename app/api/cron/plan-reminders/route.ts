import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

// This is a "cron" endpoint. In a real deployment, you would configure Vercel Cron
// or an external scheduler to hit this endpoint (e.g., daily).
// It requires a secret header to prevent unauthorized access.
// For now, we'll allow it to be called without secret for testing/demonstration if in DEV mode,
// but in prod it should be protected.

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    try {
      // Logic:
      // 1. Find users who have plan_reminders = TRUE
      // 2. Check their plan_reminder_frequency (monthly, quarterly, yearly)
      // 3. Check the last time they were reminded (we need a column for this, or check plan update time)
      // For simplicity, let's assume we remind based on the last 'updated_at' of their plans.
      // Or simpler: We just remind them to review plans if they haven't in X time.

      // Let's iterate users who want reminders
      const usersRes = await client.query(`
        SELECT user_id, plan_reminder_frequency, email
        FROM notification_settings
        JOIN users ON users.id = notification_settings.user_id
        WHERE plan_reminders = TRUE
      `);

      let sentCount = 0;

      for (const user of usersRes.rows) {
        // Check when they last updated ANY plan
        const plansRes = await client.query(`
          SELECT updated_at FROM plans WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1
        `, [user.user_id]);

        let lastUpdate = new Date(0); // Default to long ago if no plans
        if (plansRes.rows.length > 0) {
          lastUpdate = new Date(plansRes.rows[0].updated_at);
        }

        const now = new Date();
        const diffMs = now.getTime() - lastUpdate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        let thresholdDays = 30; // monthly default
        if (user.plan_reminder_frequency === 'quarterly') thresholdDays = 90;
        if (user.plan_reminder_frequency === 'yearly') thresholdDays = 365;

        // If it's been longer than threshold, send reminder
        // Note: To prevent spamming daily, we should ideally store "last_reminder_sent_at" in notification_settings.
        // For this patch, we'll omit that complexity but acknowledge it.
        // A simple hack: Only send if diffDays is "close" to a multiple of threshold?
        // Or just send it.
        // Let's assume this runs once a day.

        if (diffDays >= thresholdDays) {
           // To avoid daily spam, we really need a 'last_reminder_sent' column.
           // Let's check the notifications table to see if we sent one recently (e.g. in last 7 days).
           const lastNotif = await client.query(`
             SELECT created_at FROM notifications
             WHERE user_id = $1 AND type = 'plan'
             ORDER BY created_at DESC LIMIT 1
           `, [user.user_id]);

           let daysSinceLastNotif = 999;
           if (lastNotif.rows.length > 0) {
             const lastNotifDate = new Date(lastNotif.rows[0].created_at);
             daysSinceLastNotif = (now.getTime() - lastNotifDate.getTime()) / (1000 * 60 * 60 * 24);
           }

           // Don't nag more than once every 7 days even if overdue
           if (daysSinceLastNotif > 7) {
             await sendNotification(
               user.user_id,
               'Plan Review Reminder',
               `It's been over ${Math.floor(diffDays)} days since you updated your emergency plans. Please review them.`,
               'plan',
               '/dashboard/plans'
             );
             sentCount++;
           }
        }
      }

      return NextResponse.json({ success: true, sent: sentCount });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error running plan reminders:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
