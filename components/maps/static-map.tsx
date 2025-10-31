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
  if (!apiKey || waypoints.length === 0) {
    return <p>Map data is not available.</p>;
  }

  const mapSize = "600x400";
  const path = waypoints.map(wp => `${wp.latitude},${wp.longitude}`).join('|');

  const markers = waypoints.map((wp, index) => {
    return `&markers=color:red|label:${index + 1}|${wp.latitude},${wp.longitude}`;
  }).join('');

  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=${mapSize}&path=color:0x0000ff|weight:5|${path}${markers}&key=${apiKey}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={mapUrl} alt="Route map" style={{ width: '100%', maxWidth: '600px' }} />
  );
};

export default StaticMap;
