
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { RideRequest } from '../../types';

interface MapboxProviderFeedProps {
  map: mapboxgl.Map;
  jobs: RideRequest[];
  onJobSelect?: (job: RideRequest) => void;
}

export const MapboxProviderFeed: React.FC<MapboxProviderFeedProps> = ({ map, jobs, onJobSelect }) => {
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});

  useEffect(() => {
    if (!map) return;

    const currentIds = jobs.map(j => j.id);
    const markerIds = Object.keys(markersRef.current);

    // Remove old markers
    markerIds.forEach(id => {
      if (!currentIds.includes(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    jobs.forEach(job => {
      const coords: [number, number] = [job.pickup.lng, job.pickup.lat];

      if (markersRef.current[job.id]) {
        markersRef.current[job.id].setLngLat(coords);
        const el = markersRef.current[job.id].getElement();
        (el as any)._job = job;
        (el as any)._onJobSelect = onJobSelect;
      } else {
        const el = document.createElement('div');
        el.className = 'job-marker-mapbox';
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        (el as any)._job = job;
        (el as any)._onJobSelect = onJobSelect;
        
        const getCategoryIcon = (category?: string) => {
          switch(category) {
            case 'SHOPPING': return 'shopping_bag';
            case 'PICKUP_DROPOFF': return 'package_2';
            case 'HOUSEHOLD': return 'home';
            case 'ADMIN_QUEUE': return 'hourglass_empty';
            case 'LIFESTYLE': return 'local_activity';
            case 'BUSINESS': return 'business_center';
            default: return job.type === 'move' ? 'local_shipping' : 'local_taxi';
          }
        };

        el.innerHTML = `
          <div class="job-pin-wrapper" style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s ease;">
            <div class="job-price-tag" style="background: #0f172a; color: white; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 8px; margin-bottom: -4px; z-index: 2; border: 1.5px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.2); white-space: nowrap;">
              R${job.price.toFixed(0)}
            </div>
            <div class="job-icon-circle" style="width: 36px; height: 36px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2.5px solid #00C4B4; box-shadow: 0 6px 16px rgba(0,0,0,0.12);">
              <span class="material-symbols-rounded" style="font-size: 20px; color: #00C4B4; font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;">
                ${getCategoryIcon(job.errandDetails?.category)}
              </span>
            </div>
            <div class="job-pin-tip" style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #00C4B4; margin-top: -1px;"></div>
          </div>
        `;

        const handleClick = (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          console.log('Job marker clicked:', (el as any)._job?.id);
          if ((el as any)._onJobSelect) {
            (el as any)._onJobSelect((el as any)._job);
          }
        };

        el.addEventListener('click', handleClick);
        el.addEventListener('touchstart', handleClick, { passive: false });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map);

        markersRef.current[job.id] = marker;
      }
    });
  }, [map, jobs]);

  return null;
};
