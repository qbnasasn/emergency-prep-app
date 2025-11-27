import pool from '@/lib/db';
import { sendNotification } from '@/lib/notifications';

export async function checkUserInventory(userId: string) {
  const client = await pool.connect();
  try {
    // Check if user wants inventory alerts
    const settingsRes = await client.query(
        'SELECT inventory_alerts FROM notification_settings WHERE user_id = $1',
        [userId]
    );

    if (settingsRes.rows.length === 0 || settingsRes.rows[0].inventory_alerts === 'none') {
        return; // No alerts configured or user disabled them
    }

    // Find low stock items
    // Logic: quantity <= min_stock (default 0)
    const inventoryRes = await client.query(
      `SELECT id, name, quantity, min_stock FROM inventory_items WHERE user_id = $1 AND quantity <= min_stock`,
      [userId]
    );
    const lowStockItems = inventoryRes.rows;

    console.log(`User ${userId}: Found ${lowStockItems.length} low stock items.`);

    for (const item of lowStockItems) {
      // Check if an unread notification for this item already exists to prevent spam
      const itemLink = `/dashboard/inventory?itemId=${item.id}`;

      // We check for *any* unread low stock notification for this item.
      // This allows the alert to re-trigger if the previous one was read/dismissed but stock is STILL low.
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
  } catch (error) {
    console.error(`Error checking inventory for user ${userId}:`, error);
  } finally {
    client.release();
  }
}
