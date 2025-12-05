import pool from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

export async function checkUserInventory(userId: string, force: boolean = false) {
  const client = await pool.connect();
  try {
    // Check if user wants inventory alerts
    const settingsRes = await client.query(
        'SELECT inventory_alerts, inventory_check_frequency FROM notification_settings WHERE user_id = $1',
        [userId]
    );

    if (settingsRes.rows.length === 0 || settingsRes.rows[0].inventory_alerts === 'none') {
        return; // No alerts configured
    }

    const { inventory_check_frequency } = settingsRes.rows[0];
    const now = new Date();
    const isDaily = inventory_check_frequency === 'daily';
    const isWeekly = inventory_check_frequency === 'weekly' && now.getDay() === 1; // Monday
    const isMonthly = inventory_check_frequency === 'monthly' && now.getDate() === 1; // 1st of month

    // If frequency is constrained and today doesn't match, skip
    // NOTE: This applies to both Cron and Sign-in checks to respect user preference
    // Skip this check if force is true
    if (!force && !isDaily && !isWeekly && !isMonthly) {
        return;
    }

    // 1. Low Stock Check
    const lowStockRes = await client.query(
      `SELECT id, name, quantity, min_stock FROM inventory_items WHERE user_id = $1 AND quantity <= min_stock`,
      [userId]
    );

    for (const item of lowStockRes.rows) {
      await processAlert(client, userId, item, 'low_stock', force);
    }

    // 2. Expiring Soon Check (30 days)
    const expiringRes = await client.query(
        `SELECT id, name, expiry_date FROM inventory_items
         WHERE user_id = $1 AND expiry_date IS NOT NULL
         AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
         AND expiry_date >= CURRENT_DATE`,
        [userId]
    );

    for (const item of expiringRes.rows) {
        await processAlert(client, userId, item, 'expiring', force);
    }

    // 3. Expired Check
    const expiredRes = await client.query(
        `SELECT id, name, expiry_date FROM inventory_items
         WHERE user_id = $1 AND expiry_date IS NOT NULL
         AND expiry_date < CURRENT_DATE`,
        [userId]
    );

    for (const item of expiredRes.rows) {
        await processAlert(client, userId, item, 'expired', force);
    }

  } catch (error) {
    console.error(`Error checking inventory for user ${userId}:`, error);
  } finally {
    client.release();
  }
}

async function processAlert(client: any, userId: string, item: any, type: 'low_stock' | 'expiring' | 'expired', force: boolean) {
    const itemLink = `/dashboard/inventory?itemId=${item.id}&alert=${type}`;

    if (!force) {
        // Check deduplication / throttle
        // We select the most recent notification for this user/link
        const lastNotifRes = await client.query(
            `SELECT created_at FROM notifications WHERE user_id = $1 AND link = $2 ORDER BY created_at DESC LIMIT 1`,
            [userId, itemLink]
        );

        if (lastNotifRes.rows.length > 0) {
            const lastCreatedAt = new Date(lastNotifRes.rows[0].created_at);
            const now = new Date();
            const diffMs = now.getTime() - lastCreatedAt.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);

            // Throttle if less than 24 hours
            if (diffHours < 24) {
                return;
            }
        }
    }

    let title = '';
    let message = '';

    if (type === 'low_stock') {
        title = 'Low Stock Alert';
        message = `Item "${item.name}" is running low (${item.quantity} remaining).`;
    } else if (type === 'expiring') {
        title = 'Expiration Warning';
        // Format date logic if needed, or just say it's soon
        const dateStr = new Date(item.expiry_date).toLocaleDateString();
        message = `Item "${item.name}" is expiring soon on ${dateStr}.`;
    } else if (type === 'expired') {
        title = 'Item Expired';
        const dateStr = new Date(item.expiry_date).toLocaleDateString();
        message = `Item "${item.name}" expired on ${dateStr}. Please discard or replace.`;
    }

    await sendNotification(userId, title, message, 'inventory', itemLink);
}
