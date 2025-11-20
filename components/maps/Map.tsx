'use client'

import React, { useEffect, useRef, useState } from 'react';
import { mapsLoader } from '@/lib/maps-loader';

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Kit {
  id: string;
  name: string;
  gps_location: { x: number, y: number } | null;
}

interface MapProps {
  waypoints?: Location[];
  locations?: Location[];
  kits?: Kit[];
}

const Map: React.FC<MapProps> = ({ waypoints, locations, kits }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]); // Store markers for cleanup
  const [isMapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    mapsLoader.importLibrary('maps').then(({ Map, InfoWindow }) => {
      if (!mapRef.current) return;

      // Initialize map only once
      if (!mapInstance.current) {
        mapInstance.current = new Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.0060 }, // Default center
          zoom: 8,
          mapId: 'SAFEPREP_MAIN_MAP',
        });
        setMapInitialized(true);
      }

      // Initialize InfoWindow only once
      if (!infoWindowRef.current) {
        infoWindowRef.current = new InfoWindow();
      }

      // Clear existing markers
      markersRef.current.forEach(marker => {
        google.maps.event.clearInstanceListeners(marker); // Clear listeners to prevent leaks
        marker.setMap(null);
      });
      markersRef.current = [];

      const addHoverListener = (marker: google.maps.Marker, content: string) => {
        marker.addListener('mouseover', () => {
          infoWindowRef.current?.setContent(`<div style="padding: 5px; font-weight: bold; color: black;">${content}</div>`);
          infoWindowRef.current?.open(mapInstance.current, marker);
        });
        marker.addListener('mouseout', () => {
           infoWindowRef.current?.close();
        });
      };

      // Locations (Standard Red Pins)
      if (locations) {
        locations.forEach(location => {
          const marker = new google.maps.Marker({
            map: mapInstance.current,
            position: { lat: location.latitude, lng: location.longitude },
            title: location.name,
          });
          addHoverListener(marker, location.name);
          markersRef.current.push(marker);
        });

        // Center map on first location if no waypoints or kits
        if (locations.length > 0 && !waypoints && (!kits || kits.length === 0)) {
          mapInstance.current.setCenter({ lat: locations[0].latitude, lng: locations[0].longitude });
        }
      }

      // Kits (Blue Pins)
      if (kits) {
        kits.forEach(kit => {
          if (kit.gps_location) {
             // Based on user report (pins in Antarctica), the backend stores x=Lat, y=Lng.
             const marker = new google.maps.Marker({
              map: mapInstance.current,
              position: { lat: kit.gps_location.x, lng: kit.gps_location.y },
              title: `Kit: ${kit.name}`,
              icon: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' // Use HTTPS
            });
            addHoverListener(marker, `Kit: ${kit.name}`);
            markersRef.current.push(marker);
          }
        });
      }

    }).catch(e => {
      console.error("Failed to load Google Maps", e);
    });
  }, [locations, kits, waypoints]); // Re-run when data changes

  useEffect(() => {
    if (!isMapInitialized || !mapInstance.current || !waypoints || waypoints.length < 2) return;

    mapsLoader.importLibrary('routes').then(async () => {
      const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary('routes') as google.maps.RoutesLibrary;

      const directionsService = new DirectionsService();
      const directionsRenderer = new DirectionsRenderer();
      directionsRenderer.setMap(mapInstance.current);

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
      console.error("Failed to load Google Maps Routes", e);
    });
  }, [waypoints, isMapInitialized]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />;
};

export default Map;
