import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  console.log(`[Test Alert] Triggered for user: ${userId}`);

  const client = await pool.connect();
  try {
    // Find a low stock item for the logged-in user
    const inventoryRes = await client.query(
      `SELECT id, name, quantity, min_stock FROM inventory_items WHERE user_id = $1 AND quantity <= min_stock LIMIT 1`,
      [userId]
    );
    const lowStockItem = inventoryRes.rows[0];

    if (lowStockItem) {
      console.log(`Found low stock item: ${lowStockItem.name}`);
      await sendNotification(
        userId,
        'Low Stock Alert (Manual Test)',
        `Your inventory item "${lowStockItem.name}" is running low. Only ${lowStockItem.quantity} left in stock.`,
        'inventory',
        `/dashboard/inventory?itemId=${lowStockItem.id}`
      );
      console.log(`Notification sent for item: ${lowStockItem.name}`);
      return NextResponse.json({ success: true, message: `Test notification sent for item: ${lowStockItem.name}` });
    } else {
      console.log('No low stock items found for this user.');
      return NextResponse.json({ success: true, message: 'No low stock items found for this user.' });
    }
  } catch (error) {
    console.error('Error during manual low stock alert test:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
