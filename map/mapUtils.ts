/**
 * Map Utilities
 * 
 * Utility functions for map-related calculations and filtering
 */

import { Office } from '../renderer/src/types/firestore';
import { BARCELONA_CENTER, RADIUS_METERS } from './mapConstants';

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filter offices within configured radius of Barcelona center
 */
export function filterOfficesInRadius(offices: Office[]): Office[] {
  return offices.filter(office => {
    if (!office.location?.headquarters?.coordinates) {
      return false;
    }
    
    const coords = office.location.headquarters.coordinates;
    const lat = coords.latitude;
    const lng = coords.longitude;
    
    const distance = calculateDistance(
      BARCELONA_CENTER.lat,
      BARCELONA_CENTER.lng,
      lat,
      lng
    );
    
    return distance <= RADIUS_METERS;
  });
}

/**
 * Calculate map bounds for a given center point and radius
 * Returns bounds in format: [[swLng, swLat], [neLng, neLat]]
 */
export function calculateMapBounds(centerLat: number, centerLng: number, radiusKm: number): [[number, number], [number, number]] {
  // Approximate degrees per km (varies by latitude)
  const latDegreesPerKm = 1 / 111;
  const lngDegreesPerKm = 1 / (111 * Math.cos(centerLat * Math.PI / 180));
  
  const latOffset = radiusKm * latDegreesPerKm;
  const lngOffset = radiusKm * lngDegreesPerKm;
  
  return [
    [centerLng - lngOffset, centerLat - latOffset], // Southwest corner
    [centerLng + lngOffset, centerLat + latOffset]  // Northeast corner
  ];
}

