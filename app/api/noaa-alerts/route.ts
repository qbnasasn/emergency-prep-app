import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getAuthUser } from '@/lib/auth';

interface NoaaLocation {
    id: string;
    latitude: number | null;
    longitude: number | null;
}

interface AlertFeature {
    id: string;
    properties: {
        headline: string;
        severity: string;
        event: string;
        description: string;
        areaDesc: string;
        effective: string;
        expires: string;
    };
}

async function fetchAlertsForLocation(lat: number, lon: number) {
    const url = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
    try {
        const response = await fetch(url, { headers: { 'User-Agent': '(readysetprepper.com, info@readysetprepper.com)' }});
        if (!response.ok) {
            console.error(`Failed to fetch alerts for ${lat},${lon}: ${response.statusText}`);
            return [];
        }
        const data = await response.json();
        return data.features as AlertFeature[];
    } catch (error) {
        console.error(`Error fetching alerts for ${lat},${lon}:`, error);
        return [];
    }
}

export async function GET(req: Request) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const client = await pool.connect();
    try {
        const result = await client.query('SELECT id, latitude, longitude FROM noaa_locations WHERE user_id = $1', [userId]);
        const locations: NoaaLocation[] = result.rows;

        if (locations.length === 0) {
            return NextResponse.json([]);
        }

        const allAlertsPromises = locations
            .filter(loc => loc.latitude !== null && loc.longitude !== null)
            .map(loc => fetchAlertsForLocation(loc.latitude!, loc.longitude!));

        const allAlertsArrays = await Promise.all(allAlertsPromises);
        const allAlerts = allAlertsArrays.flat();

        const uniqueAlerts = Array.from(new Map(allAlerts.map(alert => [alert.id, alert])).values());

        const formattedAlerts = uniqueAlerts.map(alert => ({
            id: alert.id,
            title: alert.properties.headline || alert.properties.event,
            severity: alert.properties.severity,
            description: alert.properties.description,
            area: alert.properties.areaDesc,
            expires: alert.properties.expires,
        }));

        return NextResponse.json(formattedAlerts);

    } catch (error) {
        console.error('Error fetching NOAA alerts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}
