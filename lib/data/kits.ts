import pool from '@/lib/db';

export type Kit = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  gps_location: { x: number, y: number } | null;
  created_at: string;
  category: string | null;
  item_count?: number;
};

export async function getKits(householdId: string): Promise<Kit[]> {
  const query = {
    text: `
      SELECT
        k.*,
        (SELECT COUNT(*) FROM kit_items ki WHERE ki.kit_id = k.id)::INTEGER as item_count
      FROM kits k
      JOIN users u ON k.user_id = u.id
      WHERE u.household_id = $1
      ORDER BY k.created_at DESC;
    `,
    values: [householdId],
  };
  const result = await pool.query(query);
  return result.rows as Kit[];
}
