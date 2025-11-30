import { NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/auth"
import pool from '@/lib/db';

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = user.id;

    const res = await pool.query('SELECT * FROM notification_settings WHERE user_id = $1', [userId]);

    // Return empty object if no settings found (client will handle defaults) or default row
    const settings = res.rows[0] || {
      email_alerts: false,
      weather_alerts: 'none',
      inventory_alerts: 'none',
      plan_reminders: 'none',
      shopping_updates: 'none',
      inventory_check_frequency: 'weekly',
      plan_reminder_frequency: 'monthly'
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await pool.connect();

  try {
    const body = await request.json();
    const {
      email_alerts,
      weather_alerts,
      inventory_alerts,
      plan_reminders,
      // shopping_updates removed
      inventory_check_frequency,
      plan_reminder_frequency
    } = body;

    const userId = user.id;

    await client.query('BEGIN');

    // Upsert settings
    // We hardcode shopping_updates to 'none' on insert and ignore on update to effectively deprecate it
    const query = `
      INSERT INTO notification_settings (
        user_id, email_alerts, weather_alerts, inventory_alerts, plan_reminders, shopping_updates, inventory_check_frequency, plan_reminder_frequency, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'none', $6, $7, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        email_alerts = EXCLUDED.email_alerts,
        weather_alerts = EXCLUDED.weather_alerts,
        inventory_alerts = EXCLUDED.inventory_alerts,
        plan_reminders = EXCLUDED.plan_reminders,
        inventory_check_frequency = EXCLUDED.inventory_check_frequency,
        plan_reminder_frequency = EXCLUDED.plan_reminder_frequency,
        updated_at = NOW()
      RETURNING *;
    `;

    const res = await client.query(query, [
      userId,
      email_alerts,
      weather_alerts,
      inventory_alerts,
      plan_reminders,
      inventory_check_frequency || 'weekly',
      plan_reminder_frequency || 'monthly'
    ]);

    // Cleanup unread notifications if an alert type is disabled
    if (inventory_alerts === 'none') {
        await client.query("DELETE FROM notifications WHERE user_id = $1 AND type = 'inventory' AND read = false", [userId]);
    }
    if (weather_alerts === 'none') {
        await client.query("DELETE FROM notifications WHERE user_id = $1 AND type = 'weather' AND read = false", [userId]);
    }
    if (plan_reminders === 'none') {
        await client.query("DELETE FROM notifications WHERE user_id = $1 AND type = 'plan' AND read = false", [userId]);
    }
    // Also clean up any lingering shopping alerts
    await client.query("DELETE FROM notifications WHERE user_id = $1 AND type = 'shopping' AND read = false", [userId]);

    await client.query('COMMIT');
    return NextResponse.json(res.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
