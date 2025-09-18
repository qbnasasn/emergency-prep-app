'use client'

import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Location } from './plan-builder'; // Assuming Location type is exported from here

interface RouteMapProps {
  waypoints: Location[];
}

const RouteMap: React.FC<RouteMapProps> = ({ waypoints }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: ['marker', 'routes'], // Use new 'routes' library
    });

    loader.importLibrary('maps').then(async ({ Map }) => {
      const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary('routes') as google.maps.RoutesLibrary;

      if (!mapRef.current) return;

      const map = new Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // Default center
        zoom: 8,
        mapId: 'SAFEPREP_ROUTE_MAP', // Required for advanced markers
      });

      if (waypoints.length < 2) {
        // Not enough waypoints to draw a route, maybe show markers?
        waypoints.forEach(waypoint => {
            new google.maps.Marker({
                map,
                position: { lat: waypoint.latitude, lng: waypoint.longitude },
                title: waypoint.name,
            });
        });
        if (waypoints.length > 0) {
            map.setCenter({ lat: waypoints[0].latitude, lng: waypoints[0].longitude });
        }
        return;
      }

      const directionsService = new DirectionsService();
      const directionsRenderer = new DirectionsRenderer();
      directionsRenderer.setMap(map);

      const origin = { lat: waypoints[0].latitude, lng: waypoints[0].longitude };
      const destination = { lat: waypoints[waypoints.length - 1].latitude, lng: waypoints[waypoints.length - 1].longitude };
      const intermediateWaypoints = waypoints.slice(1, -1).map(wp => ({
        location: { lat: wp.latitude, lng: wp.longitude },
        stopover: true,
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints: intermediateWaypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
          } else {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
    }).catch(e => {
        console.error("Failed to load Google Maps", e);
    });

  }, [waypoints]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: '8px' }} />;
};

export default RouteMap;
