import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Office } from '../../types/firestore';
import { firestoreOperations } from '../../services/firebase/firestoreOperations';
import { navigationService } from '../../services/navigation/navigationService';
import { BARCELONA_CENTER, RADIUS_KM } from '../../../../map/mapConstants';
import { filterOfficesInRadius, calculateMapBounds } from '../../../../map/mapUtils';

export const BarcelonaMapPage: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [pitch, setPitch] = useState<number>(0);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
    console.log('Map: Token check - exists:', !!token, 'length:', token?.length || 0);
    if (token) {
      setMapboxToken(token);
      mapboxgl.accessToken = token;
      console.log('Map: Token set successfully');
    } else {
      console.error('Map: No token found');
      setError('Mapbox token not configured. Please set VITE_MAPBOX_TOKEN environment variable.');
      setLoading(false);
    }
  }, []);

  // Function to initialize map when both container and token are ready
  const initializeMap = () => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const container = mapContainerRef.current;
    console.log('Map: Initializing map...');
    
    try {
      const map = new mapboxgl.Map({
        container: container,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [BARCELONA_CENTER.lng, BARCELONA_CENTER.lat],
        zoom: 12,
        pitch: pitch,
        bearing: 0,
        attributionControl: false
      });

      map.on('load', () => {
        console.log('Map: Loaded successfully');
        setLoading(false);
        setTimeout(() => {
          try { map.resize(); } catch {}
        }, 100);
      });

      map.on('error', (e: any) => {
        console.error('Map error:', e);
        setError(`Failed to load map: ${e.error?.message || 'Unknown error'}. Please check your Mapbox token.`);
        setLoading(false);
      });

      // Restrict panning to bounds
      const bounds = calculateMapBounds(BARCELONA_CENTER.lat, BARCELONA_CENTER.lng, RADIUS_KM + 5);
      map.setMaxBounds(bounds as any);

      // Setup terrain and hide all label layers once style loads
      map.on('style.load', () => {
        try {
          // Hide all symbol (label) layers
          const style = map.getStyle();
          if (style && style.layers) {
            for (const layer of style.layers) {
              if (layer.type === 'symbol' && map.getLayer(layer.id)) {
                try { map.setLayoutProperty(layer.id, 'visibility', 'none'); } catch {}
              }
            }
          }

          // Add contour source for terrain lines
          if (!map.getSource('contours')) {
            map.addSource('contours', {
              type: 'vector',
              url: 'mapbox://mapbox.mapbox-terrain-v2'
            } as any);
          }

          // Add contour lines layer if it doesn't exist
          if (!map.getLayer('contour-lines')) {
            map.addLayer({
              id: 'contour-lines',
              type: 'line',
              source: 'contours',
              'source-layer': 'contour',
              paint: {
                'line-color': '#C8EDFC',
                'line-width': 0.5,
                'line-opacity': 0.6
              },
              filter: ['==', 'type', 'contour']
            } as any);
          }

          // Add contour labels if not present
          if (!map.getLayer('contour-labels')) {
            map.addLayer({
              id: 'contour-labels',
              type: 'symbol',
              source: 'contours',
              'source-layer': 'contour',
              paint: {
                'text-color': '#C8EDFC',
                'text-halo-color': '#000000',
                'text-halo-width': 1
              },
              layout: {
                'text-field': ['get', 'ele'],
                'text-font': ['Open Sans Regular'],
                'text-size': 10,
                'text-allow-overlap': true,
                'symbol-placement': 'line'
              },
              filter: ['==', 'type', 'contour']
            } as any);
          }
        } catch (err) {
          console.warn('Terrain/label adjustments not available:', err);
        }
      });

      mapRef.current = map;
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map');
      setLoading(false);
    }
  };

  // Callback ref for container
  const mapContainerCallback = (node: HTMLDivElement | null) => {
    mapContainerRef.current = node;
    if (node) {
      initializeMap();
    }
  };

  // Also try to initialize when token becomes available
  useEffect(() => {
    if (mapboxToken && mapContainerRef.current && !mapRef.current) {
      initializeMap();
    }
  }, [mapboxToken]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Load offices and create markers
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

  // Update markers when offices change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add markers as simple dots with hover popup
    for (const office of offices) {
      const coords = office.location?.headquarters?.coordinates;
      if (!coords) continue;

      const el = document.createElement('div');
      el.style.width = '8px';
      el.style.height = '8px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#C8EDFC';
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'left',
        offset: [8, 0]
      }).setText(office.name).setMaxWidth('none');

      el.addEventListener('mouseenter', () => {
        popup.setLngLat([coords.longitude, coords.latitude]).addTo(map);
      });
      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

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
      <style>{`
        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
        .mapboxgl-popup { max-width: none !important; }
        .mapboxgl-popup-content {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          color: #C8EDFC !important;
          font-size: 10px;
          text-transform: uppercase;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          white-space: nowrap !important;
          overflow: visible !important;
        }
        .mapboxgl-popup-tip { display: none !important; }
      `}</style>

      <div ref={mapContainerCallback} style={{ width: '100%', height: '100%' }} />
      
      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.8)', 
          color: '#C8EDFC', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', 
          fontSize: '12px', 
          textTransform: 'uppercase',
          zIndex: 1000
        }}>
          Loading map...
        </div>
      )}
    </div>
  );
};
