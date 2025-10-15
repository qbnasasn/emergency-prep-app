import { Kysely } from 'kysely';
import { NeonDialect } from 'kysely-neon';

// NOTE: This file has been temporarily modified to remove authentication
// to allow the application to build. The map data will not be loaded.

interface Database {
  noaa_locations: { id: string; name: string; latitude: number; longitude: number; user_id: string; };
  plan_locations: { id: string; name: string; latitude: number; longitude: number; plan_id: string; };
  plans: { id: string; user_id: string; };
  kits: { id: string; name: string; gps_location: { x: number; y: number }; user_id: string; };
}

const db = new Kysely<Database>({
  dialect: new NeonDialect({
    connectionString: process.env.POSTGRES_URL,
  }),
});

export const getUserLocations = async (userId?: string) => {
  if (!userId) {
    // Return empty array to prevent build errors
    return [];
  }

  const userLocations = await db.selectFrom('noaa_locations')
    .selectAll()
    .where('user_id', '=', userId)
    .execute();

  const planLocations = await db.selectFrom('plan_locations')
    .selectAll()
    .where('plan_id', 'in', (eb) => eb.selectFrom('plans').select('id').where('user_id', '=', userId))
    .execute();

  const kits = await db.selectFrom('kits')
    .select(['id', 'name', 'gps_location'])
    .where('user_id', '=', userId)
    .where('gps_location', 'is not', null)
    .execute();

  const allLocations = [
    ...userLocations.map(location => ({
      id: location.id,
      name: location.name,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    })),
    ...planLocations.map(location => ({
      id: location.id,
      name: location.name,
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
    })),
    ...kits.map(kit => ({
      id: kit.id,
      name: kit.name,
      latitude: kit.gps_location.y,
      longitude: kit.gps_location.x,
    }))
  ];

  return allLocations;
};