

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Office } from '../renderer/src/types/firestore';
import { firestoreOperations } from '../renderer/src/services/firebase/firestoreOperations';
import { navigationService } from '../renderer/src/services/navigation/navigationService';
import { BARCELONA_CENTER, RADIUS_KM } from './mapConstants';
import { filterOfficesInRadius, calculateMapBounds } from './mapUtils';

export const BarcelonaMapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    const token = (import.meta as any).env?.VITE_MAPBOX_TOKEN || '';
    if (token) {
      setMapboxToken(token);
      mapboxgl.accessToken = token;
    } else {
      setError('Mapbox token not configured. Please set VITE_MAPBOX_TOKEN environment variable.');
      setLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapboxToken) return;
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
      zoom: 12,
      pitch: 30,
      bearing: 0
    });

    // Wait for map to load
    map.on('load', () => {
      setLoading(false);
    });

    map.on('error', (e) => {
      console.error('Map error:', e);
      setError('Failed to load map. Please check your Mapbox token.');
    });

    // Restrict panning to bounds
    const bounds = calculateMapBounds(BARCELONA_CENTER.lat, BARCELONA_CENTER.lng, RADIUS_KM + 5);
    map.setMaxBounds(bounds as any);

    // Optional terrain
    map.on('style.load', () => {
      try {
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.terrain-rgb',
            tileSize: 512,
            maxzoom: 14
          } as any);
        }
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 } as any);
      } catch (err) {
        console.warn('Terrain not available:', err);
      }
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  // Load offices
  useEffect(() => {
    const fetchOffices = async () => {
      if (!mapboxToken) return;
      try {
        const result = await firestoreOperations.queryOffices();
        if (result.success && result.data) {
          const filteredOffices = filterOfficesInRadius(result.data);
          setOffices(filteredOffices);
        } else {
          setError(result.error || 'Failed to load offices');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load offices');
      }
    };
    fetchOffices();
  }, [mapboxToken]);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    for (const office of offices) {
      const coords = office.location?.headquarters?.coordinates;
      if (!coords) continue;

      const el = document.createElement('div');
      el.style.backgroundColor = '#C8EDFC';
      el.style.color = '#000000';
      el.style.padding = '4px 8px';
      el.style.borderRadius = '4px';
      el.style.fontSize = '10px';
      el.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';
      el.style.textTransform = 'uppercase';
      el.style.whiteSpace = 'nowrap';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.title = office.name;
      el.innerText = office.name;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([coords.longitude, coords.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    }
  }, [offices]);

  const handleClose = () => {
    navigationService.navigateToCross();
  };

  if (!mapboxToken) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000000', color: '#C8EDFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', fontSize: '12px', textTransform: 'uppercase' }}>
        <div>
          <div style={{ marginBottom: '20px' }}>Mapbox token not configured</div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>Please set VITE_MAPBOX_TOKEN environment variable</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000000', color: '#C8EDFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', fontSize: '12px', textTransform: 'uppercase' }}>
        Loading map...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000000', color: '#C8EDFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', fontSize: '12px', textTransform: 'uppercase' }}>
        <div>
          <div style={{ marginBottom: '20px' }}>Error: {error}</div>
          <button onClick={handleClose} style={{ padding: '10px 20px', backgroundColor: '#C8EDFC', color: '#000000', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'inherit' }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      <button
        onClick={handleClose}
        style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px 20px', backgroundColor: '#C8EDFC', color: '#000000', border: 'none', cursor: 'pointer', fontSize: '10px', textTransform: 'uppercase', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
      >
        Close
      </button>

      <div
        style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'rgba(0, 0, 0, 0.7)', color: '#C8EDFC', padding: '10px 15px', fontSize: '10px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', textTransform: 'uppercase', zIndex: 1000 }}
      >
        Barcelona Map - {offices.length} offices within {RADIUS_KM}km radius
      </div>
    </div>
  );
};

