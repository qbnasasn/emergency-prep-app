'use client'

import React, { useEffect, useRef } from 'react';
import { mapsLoader } from '@/lib/maps-loader';

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  waypoints?: Location[];
  locations?: Location[];
  showWeather?: boolean;
}

const Map: React.FC<MapProps> = ({ waypoints, locations, showWeather }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const weatherLayer = useRef<google.maps.weather.WeatherLayer | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);

  // Initialize Map
  useEffect(() => {
    mapsLoader.importLibrary('maps').then(({ Map }) => {
      if (!mapRef.current) return;
      if (mapInstance.current) return; // Prevent re-initialization

      mapInstance.current = new Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // Default center
        zoom: 8,
        mapId: 'SAFEPREP_MAIN_MAP',
      });
    }).catch(e => {
      console.error("Failed to load Google Maps", e);
    });
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapInstance.current || !locations) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];

    const infoWindow = new google.maps.InfoWindow();

    locations.forEach(location => {
      const marker = new google.maps.Marker({
        map: mapInstance.current,
        position: { lat: location.latitude, lng: location.longitude },
        title: location.name,
      });

      marker.addListener('mouseover', () => {
        infoWindow.setContent(`<strong>${location.name}</strong>`);
        infoWindow.open(mapInstance.current, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      markers.current.push(marker);
    });

    if (locations.length > 0 && (!waypoints || waypoints.length === 0)) {
      // Center map on the first location if no route is displayed
      mapInstance.current.setCenter({ lat: locations[0].latitude, lng: locations[0].longitude });
    }
  }, [locations]);

  // Update Routes
  useEffect(() => {
    if (!mapInstance.current) return;

    if (!directionsRenderer.current) {
      mapsLoader.importLibrary('routes').then(() => {
        directionsRenderer.current = new google.maps.DirectionsRenderer();
        directionsRenderer.current.setMap(mapInstance.current);
      });
    }

    if (!waypoints || waypoints.length < 2) {
      if (directionsRenderer.current) {
        directionsRenderer.current.setDirections({ routes: [] }); // Clear previous routes
      }
      return;
    }

    mapsLoader.importLibrary('routes').then(async () => {
      const { DirectionsService } = await google.maps.importLibrary('routes') as google.maps.RoutesLibrary;
      const directionsService = new DirectionsService();

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
          if (status === google.maps.DirectionsStatus.OK && directionsRenderer.current) {
            directionsRenderer.current.setDirections(result);
          } else {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
    }).catch(e => {
      console.error("Failed to load Google Maps Routes", e);
    });
  }, [waypoints]);

  // Update Weather
  useEffect(() => {
    if (!mapInstance.current) return;

    if (showWeather) {
      mapsLoader.importLibrary('weather').then(() => {
        if (!weatherLayer.current) {
          weatherLayer.current = new google.maps.weather.WeatherLayer({
            temperatureUnit: google.maps.weather.TemperatureUnit.FAHRENHEIT,
            windSpeedUnit: google.maps.weather.WindSpeedUnit.MILES_PER_HOUR,
          });
        }
        weatherLayer.current.setMap(mapInstance.current);
      }).catch(e => {
        console.error("Failed to load Google Maps Weather", e);
      });
    } else {
      if (weatherLayer.current) {
        weatherLayer.current.setMap(null);
      }
    }
  }, [showWeather]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />;
};

export default Map;