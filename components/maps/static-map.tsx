import React from 'react';

interface Waypoint {
  latitude: number;
  longitude: number;
}

interface StaticMapProps {
  waypoints: Waypoint[];
  apiKey: string;
}

const StaticMap: React.FC<StaticMapProps> = ({ waypoints, apiKey }) => {
  // Filter out invalid waypoints just in case
  const validWaypoints = waypoints.filter(wp =>
    !isNaN(wp.latitude) &&
    !isNaN(wp.longitude) &&
    wp.latitude !== null &&
    wp.longitude !== null
  );

  if (!apiKey || validWaypoints.length === 0) {
    return <p>Map data is not available.</p>;
  }

  const mapSize = "600x400";
  const path = validWaypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|');

  const markers = validWaypoints.map((wp, index) => {
    return `&markers=color:red|label:${index + 1}|${wp.latitude},${wp.longitude}`;
  }).join('');

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=${mapSize}&path=color:0x0000ff|weight:5|${path}${markers}&key=${apiKey}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={mapUrl} alt="Route map" style={{ width: '100%', maxWidth: '600px' }} />
  );
};

export default StaticMap;
