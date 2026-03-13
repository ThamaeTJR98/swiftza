
import React, { useEffect, useRef } from 'react';
import { RideRequest } from '../../types';

interface ProviderMapFeedProps {
  map: any;
  jobs: RideRequest[];
  onJobSelect?: (job: RideRequest) => void;
}

declare var google: any;

export const ProviderMapFeed: React.FC<ProviderMapFeedProps> = ({ map, jobs, onJobSelect }) => {
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps.marker) return;

    const currentIds = jobs.map(j => j.id);
    const markerIds = Object.keys(markersRef.current);

    // Remove old markers
    markerIds.forEach(id => {
      if (!currentIds.includes(id)) {
        markersRef.current[id].map = null;
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    jobs.forEach(job => {
      const position = { lat: job.pickup.lat, lng: job.pickup.lng };

      if (markersRef.current[job.id]) {
        markersRef.current[job.id].position = position;
      } else {
        const container = document.createElement('div');
        container.className = 'job-marker-container';

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

        container.innerHTML = `
          <div class="job-pin-wrapper" role="button" tabindex="0" aria-label="Job Details" style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s ease; pointer-events: auto;">
            <div class="job-price-tag" style="background: #0f172a; color: white; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 8px; margin-bottom: -4px; z-index: 2; border: 1.5px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.2); white-space: nowrap; pointer-events: none;">
              R${job.price.toFixed(0)}
            </div>
            <div class="job-icon-circle" style="width: 36px; height: 36px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2.5px solid #00C4B4; box-shadow: 0 6px 16px rgba(0,0,0,0.12); transform: rotate(0deg); pointer-events: none;">
              <span class="material-symbols-rounded" style="font-size: 20px; color: #00C4B4; font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; pointer-events: none;">
                ${getCategoryIcon(job.errandDetails?.category)}
              </span>
            </div>
            <div class="job-pin-tip" style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #00C4B4; margin-top: -1px; pointer-events: none;"></div>
          </div>
          <style>
            .job-marker-container:hover .job-pin-wrapper {
              transform: scale(1.2) translateY(-4px);
              z-index: 1000;
            }
          </style>
        `;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          content: container,
          title: `Job: R${job.price}`,
          gmpClickable: true
        });

        const handleClick = () => {
          if (onJobSelect) onJobSelect(job);
        };

        marker.addListener('click', handleClick);
        container.addEventListener('click', (e) => {
          e.stopPropagation();
          handleClick();
        });

        markersRef.current[job.id] = marker;
      }
    });
  }, [map, jobs]);

  return null;
};
