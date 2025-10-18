'use client'

import React, { useEffect, useRef } from 'react';
import { mapsLoader } from '@/lib/maps-loader';

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: string;
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
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    mapsLoader.importLibrary('maps').then(({ Map }) => {
      if (!mapRef.current) return;
      mapInstance.current = new Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 8,
        mapId: 'SAFEPREP_MAIN_MAP',
      });
      infoWindow.current = new google.maps.InfoWindow();
    }).catch(e => { console.error("Failed to load Google Maps", e); });
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !locations) return;
    markers.current.forEach(marker => marker.setMap(null));
    markers.current = [];
    const bounds = new google.maps.LatLngBounds();
    locations.forEach(location => {
      const isKit = location.type === 'kit';
      const marker = new google.maps.Marker({
        map: mapInstance.current,
        position: { lat: location.latitude, lng: location.longitude },
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: isKit ? '#DB4437' : '#4285F4',
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 1.5,
          scale: 8
        },
      });
      marker.addListener('mouseover', () => {
        infoWindow.current?.setContent(`<strong>${location.name}</strong>`);
        infoWindow.current?.open(mapInstance.current, marker);
      });
      marker.addListener('mouseout', () => { infoWindow.current?.close(); });
      markers.current.push(marker);
      bounds.extend(marker.getPosition()!);
    });
    if (locations.length > 0 && (!waypoints || waypoints.length === 0)) {
      mapInstance.current.fitBounds(bounds);
    }
  }, [locations]);

  useEffect(() => {
    if (!mapInstance.current) return;
    if (!directionsRenderer.current) {
      mapsLoader.importLibrary('routes').then(() => {
        directionsRenderer.current = new google.maps.DirectionsRenderer({ suppressMarkers: true });
        directionsRenderer.current.setMap(mapInstance.current);
      });
    }
    if (!waypoints || waypoints.length < 2) {
      if (directionsRenderer.current) {
        directionsRenderer.current.setDirections({ routes: [] });
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
        { origin, destination, waypoints: intermediateWaypoints, travelMode: google.maps.TravelMode.DRIVING },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && directionsRenderer.current) {
            directionsRenderer.current.setDirections(result);
          } else if (status !== 'OK') {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
    }).catch(e => { console.error("Failed to load Google Maps Routes", e); });
  }, [waypoints]);

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
      }).catch(e => { console.error("Failed to load Google Maps Weather", e); });
    } else {
      if (weatherLayer.current) {
        weatherLayer.current.setMap(null);
      }
    }
  }, [showWeather]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />;
};

export default Map;