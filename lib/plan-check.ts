import pool from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

export async function checkPlanReminders(userId: string) {
  const client = await pool.connect();
  try {
    const settingsRes = await client.query(
        'SELECT plan_reminders, plan_reminder_frequency FROM notification_settings WHERE user_id = $1',
        [userId]
    );

    if (settingsRes.rows.length === 0 || settingsRes.rows[0].plan_reminders === 'none') {
        return;
    }

    const { plan_reminder_frequency } = settingsRes.rows[0];
    const now = new Date();

    let shouldCheck = false;

    // Frequency Logic
    if (plan_reminder_frequency === 'weekly' && now.getDay() === 1) shouldCheck = true; // Monday
    if (plan_reminder_frequency === 'monthly' && now.getDate() === 1) shouldCheck = true; // 1st of month
    if (plan_reminder_frequency === 'yearly' && now.getMonth() === 0 && now.getDate() === 1) shouldCheck = true; // Jan 1st

    if (!shouldCheck) return;

    const link = '/dashboard/plans';
    // Deduplicate against existing unread plan notifications
    const existingRes = await client.query(
        "SELECT id FROM notifications WHERE user_id = $1 AND link = $2 AND read = false AND type = 'plan'",
        [userId, link]
    );

    if (existingRes.rows.length === 0) {
        await sendNotification(
            userId,
            'Plan Review Reminder',
            'It is time to review and update your emergency preparedness plan.',
            'plan',
            link
        );
    }

  } catch (error) {
    console.error(`Error checking plan reminders for user ${userId}:`, error);
  } finally {
    client.release();
  }
}
