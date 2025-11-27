import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { checkUserInventory } from '@/lib/inventory-check';
import { checkPlanReminders } from '@/lib/plan-check';

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
      `SELECT user_id FROM notification_settings WHERE inventory_alerts != 'none' OR plan_reminders != 'none'`
    );
    userIds = settingsRes.rows.map(row => row.user_id);
  } catch (error) {
    console.error('Error fetching users for checks:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }

  console.log(`Starting daily checks for ${userIds.length} users.`);

  for (const userId of userIds) {
    await checkUserInventory(userId);
    await checkPlanReminders(userId);
  }

  return NextResponse.json({ success: true, message: 'Daily checks complete.' });
}
