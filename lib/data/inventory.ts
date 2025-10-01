import pool from '@/lib/db';

export type InventoryItem = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  quantity: number;
  is_food_item: boolean;
  expiry_date: string | null;
  created_at: string;
  category: string | null;
  location: string | null;
  min_stock: number | null;
  cost_per_unit: number | null;
  purchase_date: string | null;
  calories: number | null;
  supplier: string | null;
  upc: string | null;
  image: string | null;
};

export async function getInventoryItems(userId: string): Promise<InventoryItem[]> {
  const query = {
    text: 'SELECT * FROM inventory_items WHERE user_id = $1',
    values: [userId],
  };
  const result = await pool.query(query);
  return result.rows as InventoryItem[];
}