import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pool from '@/lib/db';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userIdRes = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userIdRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userIdRes.rows[0].id;

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
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
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

    const userIdRes = await client.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userIdRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userIdRes.rows[0].id;

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
