import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

export async function GET(req: Request) {
  // Secure the endpoint
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const client = await pool.connect();
  try {
    // Get all users who have enabled inventory alerts (email or in-app)
    // inventory_alerts is now a text field: 'none', 'in_app', 'email', 'both'
    const settingsRes = await client.query(
      `SELECT user_id FROM notification_settings WHERE inventory_alerts != 'none'`
    );
    const userIds = settingsRes.rows.map(row => row.user_id);

    for (const userId of userIds) {
      // Find low stock items
      const inventoryRes = await client.query(
        `SELECT id, name, quantity, min_stock FROM inventory_items WHERE user_id = $1 AND quantity <= min_stock`,
        [userId]
      );
      const lowStockItems = inventoryRes.rows;

      for (const item of lowStockItems) {
        // Check if an unread notification for this item already exists to prevent spam
        const itemLink = `/dashboard/inventory?itemId=${item.id}`;
        const existingNotifRes = await client.query(
          `SELECT id FROM notifications WHERE user_id = $1 AND link = $2 AND read = false`,
          [userId, itemLink]
        );

        if (existingNotifRes.rows.length === 0) {
          await sendNotification(
            userId,
            'Low Stock Alert',
            `Your inventory item "${item.name}" is running low. Only ${item.quantity} left in stock.`,
            'inventory',
            itemLink
          );
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Inventory check complete.' });
  } catch (error) {
    console.error('Error during inventory check cron job:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
