import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import pool from '@/lib/db';

function parsePoint(pointString: string): { x: number; y: number } | null {
  if (typeof pointString !== 'string') return null;
  const match = pointString.match(/\(([^,]+),([^)]+)\)/);
  if (!match) return null;
  return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
}

export const getUserLocations = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.error("Authentication failed: No session or user ID found.");
    return []; // Return empty array if not authenticated
  }
  const userId = session.user.id;
  const client = await pool.connect();
  try {
    const noaaLocationsRes = await client.query('SELECT id, name, latitude, longitude FROM noaa_locations WHERE user_id = $1', [userId]);
    const planLocationsRes = await client.query(`SELECT pl.id, pl.name, pl.latitude, pl.longitude, pl.type as location_type FROM plan_locations pl JOIN plans p ON pl.plan_id = p.id WHERE p.user_id = $1`, [userId]);
    const kitsRes = await client.query('SELECT id, name, gps_location FROM kits WHERE user_id = $1 AND gps_location IS NOT NULL', [userId]);

    const allLocations = [
      ...noaaLocationsRes.rows.map(loc => ({ id: loc.id, name: loc.name, latitude: Number(loc.latitude), longitude: Number(loc.longitude), type: 'noaa_location' })),
      ...planLocationsRes.rows.map(loc => ({ id: loc.id, name: loc.name, latitude: Number(loc.latitude), longitude: Number(loc.longitude), type: loc.location_type || 'plan_location' })),
      ...kitsRes.rows.map(kit => {
        const gpsPoint = typeof kit.gps_location === 'string' ? parsePoint(kit.gps_location) : kit.gps_location;
        if (!gpsPoint) return null;
        return { id: kit.id, name: kit.name, latitude: gpsPoint.y, longitude: gpsPoint.x, type: 'kit' };
      }).filter(Boolean),
    ];
    return allLocations;
  } catch (error) {
    console.error("Database error in getUserLocations:", error);
    return []; // Return empty array on error
  } finally {
    client.release();
  }
};