
import React, { useEffect, useRef } from 'react';
import { RunnerLocation } from '../../types';

interface CustomerMapFeedProps {
  map: any;
  runners: Record<string, RunnerLocation>;
  onRunnerSelect?: (runner: RunnerLocation) => void;
}

declare var google: any;

export const CustomerMapFeed: React.FC<CustomerMapFeedProps> = ({ map, runners, onRunnerSelect }) => {
  const markersRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps.marker) return;

    const currentIds = Object.keys(runners);
    const markerIds = Object.keys(markersRef.current);

    // Remove old markers
    markerIds.forEach(id => {
      if (!currentIds.includes(id)) {
        markersRef.current[id].map = null;
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    currentIds.forEach(id => {
      const runner = runners[id];
      const position = { lat: runner.lat, lng: runner.lng };

      if (markersRef.current[id]) {
        // Update position and rotation
        markersRef.current[id].position = position;
        const iconElement = markersRef.current[id].content.querySelector('.runner-icon');
        if (iconElement) {
          iconElement.style.transform = `rotate(${runner.heading}deg)`;
        }
      } else {
        // Create new marker
        const container = document.createElement('div');
        container.className = 'runner-marker-container';
        
        const getIcon = (mode?: string) => {
          switch(mode) {
            case 'MOTORBIKE':
              return `<path d="M19.44 12c-.22 0-.45.07-.67.22l-4.28 3.11-2.29-1.37c.5-.56.8-1.31.8-2.13 0-1.78-1.42-3.22-3.2-3.22-1.78 0-3.2 1.44-3.2 3.22 0 .82.3 1.57.8 2.13l-2.29 1.37-4.28-3.11c-.22-.15-.45-.22-.67-.22-.67 0-1.2.53-1.2 1.2 0 .22.07.45.22.67l4.28 3.11v2.55c0 .67.53 1.2 1.2 1.2s1.2-.53 1.2-1.2v-1.55l2.29-1.37c.5.56.8 1.31.8 2.13 0 1.78 1.42 3.22 3.2 3.22s3.2-1.44 3.2-3.22c0-.82-.3-1.57-.8-2.13l2.29 1.37v1.55c0 .67.53 1.2 1.2 1.2s1.2-.53 1.2-1.2v-2.55l4.28-3.11c.15-.22.22-.45.22-.67 0-.67-.53-1.2-1.2-1.2z"/>`;
            case 'CAR':
              return `<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>`;
            case 'TRUCK':
              return `<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>`;
            default:
              return `<path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 21.5h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 10.4 17 12 17 12v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L4 7.1v5h2V9.1l1.8-.7"/>`;
          }
        };

        container.innerHTML = `
          <div class="runner-icon-wrapper" role="button" tabindex="0" aria-label="Runner Profile" style="position: relative; width: 44px; height: 44px; cursor: pointer; transition: transform 0.2s ease; pointer-events: auto;">
            <div class="runner-pulse" style="position: absolute; inset: 0; background: rgba(0, 196, 180, 0.25); border-radius: 50%; animation: pulse 2s infinite; pointer-events: none;"></div>
            <div class="runner-icon-bg" style="position: absolute; inset: 4px; background: white; border-radius: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 2.5px solid #00C4B4; display: flex; align-items: center; justify-center; pointer-events: none;">
              <div class="runner-icon" style="width: 24px; height: 24px; display: flex; align-items: center; justify-center; transform: rotate(${runner.heading}deg); transition: transform 0.3s ease-out; pointer-events: none;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#00C4B4">
                  ${getIcon(runner.mode)}
                </svg>
              </div>
            </div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(0.8); opacity: 0.8; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            .runner-marker-container:hover .runner-icon-wrapper {
              transform: scale(1.15);
              z-index: 1000;
            }
          </style>
        `;

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position,
          content: container,
          title: runner.name || 'Runner',
          gmpClickable: true
        });

        const handleClick = () => {
          if (onRunnerSelect) onRunnerSelect(runner);
        };

        marker.addListener('click', handleClick);
        container.addEventListener('click', (e) => {
          e.stopPropagation();
          handleClick();
        });

        markersRef.current[id] = marker;
      }
    });
  }, [map, runners]);

  return null;
};
