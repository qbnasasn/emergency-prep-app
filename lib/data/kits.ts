import pool from '@/lib/db';
import { sql } from 'kysely';

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
  const result = await pool.query(
    sql`
      SELECT
        k.*,
        (SELECT COUNT(*) FROM kit_items ki WHERE ki.kit_id = k.id) as item_count
      FROM kits k
      WHERE k.user_id = ${userId}
      ORDER BY k.created_at DESC;
    `
  );
  return result.rows as Kit[];
}