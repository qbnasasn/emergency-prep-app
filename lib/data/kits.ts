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

export async function getKits(userId: string): Promise<Kit[]> {
  const query = {
    text: `
      SELECT
        k.*,
        (SELECT COUNT(*) FROM kit_items ki WHERE ki.kit_id = k.id) as item_count
      FROM kits k
      WHERE k.user_id = $1
      ORDER BY k.created_at DESC;
    `,
    values: [userId],
  };
  const result = await pool.query(query);
  return result.rows as Kit[];
}