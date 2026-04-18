
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxComponentProps {
  center: { lat: number; lng: number };
  zoom?: number;
  style?: string;
  onLoad?: (map: mapboxgl.Map) => void;
  onClick?: (event: mapboxgl.MapMouseEvent) => void;
  children?: React.ReactNode;
}

const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (token) {
  mapboxgl.accessToken = token;
}

export const MapboxComponent: React.FC<MapboxComponentProps> = ({
  center,
  zoom = 14,
  style,
  onLoad,
  onClick,
  children
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMapStyle = () => {
    if (style) return style;
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11';
  };

  useEffect(() => {
    if (!mapboxgl) {
      setError('Mapbox library failed to load.');
      return;
    }
    const currentToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    console.log('Mapbox Token Prefix:', currentToken ? currentToken.substring(0, 5) + '...' : 'Missing');
    if (!currentToken) {
      setError('Mapbox access token is missing. Please set VITE_MAPBOX_ACCESS_TOKEN in Settings.');
      return;
    }
    mapboxgl.accessToken = currentToken;

    if (mapContainerRef.current && !mapRef.current) {
      console.log('Initializing Mapbox Map...');
      try {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: getMapStyle(),
          center: [center.lng, center.lat],
          zoom: zoom,
          attributionControl: false,
        });

        map.on('load', () => {
          console.log('Mapbox Map Loaded');
          setIsLoaded(true);
          if (onLoad) onLoad(map);
        });

        map.on('error', (e) => {
          console.error('Mapbox Error:', e);
          setError(`Mapbox Error: ${e.error?.message || 'Unknown error'}`);
        });

        if (onClick) {
          map.on('click', onClick);
        }

        mapRef.current = map;
      } catch (err: any) {
        console.error('Mapbox Init Exception:', err);
        setError(`Mapbox Init Failed: ${err.message}`);
      }
    }

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class' && mapRef.current) {
          mapRef.current.setStyle(getMapStyle());
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center if it changes externally (and map is loaded)
  useEffect(() => {
    if (mapRef.current && isLoaded) {
      mapRef.current.easeTo({
        center: [center.lng, center.lat],
        duration: 1000
      });
    }
  }, [center.lat, center.lng, isLoaded]);

  return (
    <div className="relative w-full h-full bg-slate-50 border-4 border-dashed border-slate-200">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-50 bg-white/80 backdrop-blur-sm">
          <div className="max-w-xs">
            <span className="material-symbols-rounded text-red-500 text-4xl mb-2">error</span>
            <p className="text-sm font-bold text-slate-900">{error}</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
      {isLoaded && children}
    </div>
  );
};
