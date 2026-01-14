import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkUserInventory } from '@/lib/inventory-check';
import { checkPlanReminders } from '@/lib/plan-check';
import { checkWeatherAlerts } from '@/lib/weather-check';

export async function GET(req: Request) {
  // Check for CRON_SECRET presence
  if (!process.env.CRON_SECRET) {
    console.error('CRON_SECRET is not defined in environment variables.');
    return new Response('Server Configuration Error: CRON_SECRET missing', { status: 500 });
  }

  // Secure the endpoint
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized cron attempt. Auth header:', authHeader);
    return new Response('Unauthorized', { status: 401 });
  }

  let userIds: string[] = [];
  const client = await pool.connect();
  try {
    // Get all users who have enabled ANY alerts
    const settingsRes = await client.query(
      `SELECT user_id FROM notification_settings WHERE inventory_alerts != 'none' OR plan_reminders != 'none' OR weather_alerts != 'none'`
    );
    userIds = settingsRes.rows.map(row => row.user_id);
  } catch (error) {
    console.error('Error fetching users for checks:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }

  console.log(`Starting master cron checks for ${userIds.length} users.`);

  // Process users concurrently to avoid timeouts
  const results = await Promise.allSettled(
    userIds.map(async (userId) => {
      // Run checks in parallel for each user
      await Promise.allSettled([
        checkUserInventory(userId),
        checkPlanReminders(userId),
        checkWeatherAlerts(userId)
      ]);
    })
  );

  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    console.error(`Master cron encountered ${failures.length} errors.`);
  }

  return NextResponse.json({ success: true, message: 'Master cron checks complete.' });
}
