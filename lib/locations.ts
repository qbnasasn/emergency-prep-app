import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import pool from '@/lib/db'; // Using the project's original db pool

export const getUserLocations = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }
  const userId = session.user.id;
  const client = await pool.connect();

  try {
    // Fetch NOAA locations
    const noaaLocationsRes = await client.query(
      'SELECT id, name, latitude, longitude FROM noaa_locations WHERE user_id = $1',
      [userId]
    );

    // Fetch Plan locations
    const planLocationsRes = await client.query(
      `SELECT pl.id, pl.name, pl.latitude, pl.longitude
       FROM plan_locations pl
       JOIN plans p ON pl.plan_id = p.id
       WHERE p.user_id = $1`,
      [userId]
    );

    // Fetch Kit locations
    const kitsRes = await client.query(
      'SELECT id, name, gps_location FROM kits WHERE user_id = $1 AND gps_location IS NOT NULL',
      [userId]
    );

    const allLocations = [
      ...noaaLocationsRes.rows.map(loc => ({ ...loc, latitude: Number(loc.latitude), longitude: Number(loc.longitude) })),
      ...planLocationsRes.rows.map(loc => ({ ...loc, latitude: Number(loc.latitude), longitude: Number(loc.longitude) })),
      ...kitsRes.rows.map(kit => ({
        id: kit.id,
        name: kit.name,
        latitude: kit.gps_location.y,
        longitude: kit.gps_location.x,
      }))
    ];

    return allLocations;
  } finally {
    client.release();
  }
};