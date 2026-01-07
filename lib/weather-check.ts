import pool from "@/lib/db";
import { sendNotification } from "@/lib/notifications";

export async function checkWeatherAlerts(userId: string) {
  const client = await pool.connect();

  try {
    // 1. Check user settings
    const settingsRes = await client.query(
      "SELECT weather_alerts FROM notification_settings WHERE user_id = $1",
      [userId]
    );

    if (settingsRes.rows.length === 0 || settingsRes.rows[0].weather_alerts === "none") {
      return;
    }

    // 2. Get user locations
    const locationsRes = await client.query(
      "SELECT latitude, longitude FROM noaa_locations WHERE user_id = $1",
      [userId]
    );

    const locations = locationsRes.rows;
    if (locations.length === 0) return;

    for (const loc of locations) {
      if (!loc.latitude || !loc.longitude) continue;

      try {
        // 3. Fetch alerts from Weather.gov
        const response = await fetch(
          `https://api.weather.gov/alerts/active?point=${loc.latitude},${loc.longitude}`,
          {
            headers: {
              "User-Agent": "(prep-safe-app.com, contact@prep-safe-app.com)",
              "Accept": "application/geo+json",
            },
          }
        );

        if (!response.ok) {
          console.warn(`Weather API error for user ${userId}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const alerts = data.features || [];

        for (const feature of alerts) {
          const props = feature.properties;
          const alertId = props.id;
          const title = `Weather Alert: ${props.event}`;
          const message = `${props.severity} - ${props.headline}`;
          const link = `/dashboard?weatherAlert=${alertId}`;

          // 4. Deduplication: Check if we already notified about this specific alert
          // We check the link column since we store the alertId there
          const dupCheck = await client.query(
            "SELECT id FROM notifications WHERE user_id = $1 AND link = $2",
            [userId, link]
          );

          if (dupCheck.rows.length === 0) {
            // 5. Send Notification
            await sendNotification(userId, title, message, "weather", link);
            console.log(`Sent weather alert to user ${userId}: ${props.event}`);
          }
        }
      } catch (fetchError) {
        console.error(`Error fetching weather for user ${userId}:`, fetchError);
      }
    }
  } catch (error) {
    console.error(`Error in checkWeatherAlerts for user ${userId}:`, error);
  } finally {
    client.release();
  }
}
