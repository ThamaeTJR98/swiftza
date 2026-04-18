
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { RunnerLocation } from '../../types';

interface MapboxCustomerFeedProps {
  map: mapboxgl.Map;
  runners: Record<string, RunnerLocation>;
  onRunnerSelect?: (runner: RunnerLocation) => void;
}

export const MapboxCustomerFeed: React.FC<MapboxCustomerFeedProps> = ({ map, runners, onRunnerSelect }) => {
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});

  useEffect(() => {
    if (!map) return;

    const currentIds = Object.keys(runners);
    const markerIds = Object.keys(markersRef.current);

    // Remove old markers
    markerIds.forEach(id => {
      if (!currentIds.includes(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    currentIds.forEach(id => {
      const runner = runners[id];
      const coords: [number, number] = [runner.lng, runner.lat];

      if (markersRef.current[id]) {
        markersRef.current[id].setLngLat(coords);
        const el = markersRef.current[id].getElement();
        (el as any)._runner = runner;
        (el as any)._onRunnerSelect = onRunnerSelect;
      } else {
        const el = document.createElement('div');
        el.className = 'runner-marker-mapbox';
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        (el as any)._runner = runner;
        (el as any)._onRunnerSelect = onRunnerSelect;
        
        el.innerHTML = `
          <div class="runner-pin-wrapper" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s ease;">
            <div class="runner-icon-circle" style="width: 40px; height: 40px; background: #00C4B4; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              <span class="material-symbols-rounded" style="font-size: 24px; color: white; font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">
                ${runner.mode === 'MOTORBIKE' ? 'moped' : runner.mode === 'CAR' ? 'directions_car' : 'person'}
              </span>
            </div>
          </div>
        `;

        const handleClick = (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('Runner marker clicked:', (el as any)._runner?.driver_id);
          if ((el as any)._onRunnerSelect) {
            (el as any)._onRunnerSelect((el as any)._runner);
          }
        };

        el.addEventListener('click', handleClick);
        el.addEventListener('touchstart', handleClick, { passive: false });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map);

        markersRef.current[id] = marker;
      }
    });
  }, [map, runners]);

  return null;
};
