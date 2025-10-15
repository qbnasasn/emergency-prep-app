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

  useEffect(() => {
    mapsLoader.importLibrary('maps').then(({ Map }) => {
      if (!mapRef.current) return;

      mapInstance.current = new Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // Default center
        zoom: 8,
        mapId: 'SAFEPREP_MAIN_MAP',
      });

      if (locations) {
        locations.forEach(location => {
          new google.maps.Marker({
            map: mapInstance.current,
            position: { lat: location.latitude, lng: location.longitude },
            title: location.name,
          });
        });
        if (locations.length > 0) {
          mapInstance.current.setCenter({ lat: locations[0].latitude, lng: locations[0].longitude });
        }
      }
    }).catch(e => {
      console.error("Failed to load Google Maps", e);
    });
  }, [locations]);

  useEffect(() => {
    if (!mapInstance.current || !waypoints || waypoints.length < 2) return;

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
  }, [waypoints, mapInstance.current]);

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
  }, [showWeather, mapInstance.current]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />;
};

export default Map;