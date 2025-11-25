import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { sendNotification } from '@/lib/notifications';
import { differenceInDays, parseISO } from 'date-fns';

// This endpoint should be protected by a cron job secret
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    const client = await pool.connect();
    try {
      // Get all users
      const usersRes = await client.query('SELECT id FROM users');
      const users = usersRes.rows;

      for (const user of users) {
        const userId = user.id;

        // Get all inventory items for the user
        const itemsRes = await client.query('SELECT * FROM inventory_items WHERE user_id = $1', [userId]);
        const items = itemsRes.rows;

        for (const item of items) {
          const today = new Date();

          // 1. Check for expired items
          if (item.expiry_date) {
            const expiryDate = new Date(item.expiry_date);
            if (expiryDate < today) {
              await sendNotification(
                userId,
                'Item Expired',
                `${item.name} has expired. Please check your inventory.`,
                'inventory'
              );
              continue; // Skip other checks if expired
            }

            // 2. Check for items expiring soon (e.g., within 30 days)
            const daysUntilExpiry = differenceInDays(expiryDate, today);
            if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
              await sendNotification(
                userId,
                'Item Expiring Soon',
                `${item.name} is expiring in ${daysUntilExpiry} days.`,
                'inventory'
              );
            }
          }

          // 3. Check for existing low stock items
          if (item.min_stock !== null && item.quantity < item.min_stock) {
            await sendNotification(
              userId,
              'Low Stock Reminder',
              `Reminder: Your supply of ${item.name} is low (${item.quantity} remaining).`,
              'inventory'
            );
          }
        }
      }

      return NextResponse.json({ message: 'Inventory check completed successfully.' });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error during daily inventory check:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
