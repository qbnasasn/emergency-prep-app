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
      weather_alerts: false,
      inventory_alerts: false,
      plan_reminders: false,
      shopping_updates: false
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

  try {
    const body = await request.json();
    const {
      email_alerts,
      weather_alerts,
      inventory_alerts,
      plan_reminders,
      shopping_updates
    } = body;

    const userIdRes = await pool.query('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (userIdRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = userIdRes.rows[0].id;

    // Upsert settings
    const query = `
      INSERT INTO notification_settings (
        user_id, email_alerts, weather_alerts, inventory_alerts, plan_reminders, shopping_updates, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        email_alerts = EXCLUDED.email_alerts,
        weather_alerts = EXCLUDED.weather_alerts,
        inventory_alerts = EXCLUDED.inventory_alerts,
        plan_reminders = EXCLUDED.plan_reminders,
        shopping_updates = EXCLUDED.shopping_updates,
        updated_at = NOW()
      RETURNING *;
    `;

    const res = await pool.query(query, [
      userId,
      email_alerts,
      weather_alerts,
      inventory_alerts,
      plan_reminders,
      shopping_updates
    ]);

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
