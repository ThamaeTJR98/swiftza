
import React, { useEffect, useRef, useState } from 'react';
import { RideStatus, AppView, UserRole, RunnerLocation, RideRequest } from '../types';
import { useApp } from '../context/AppContext';
import { loadGoogleMaps } from '../utils/mapLoader';
import { Icon } from './Icons';
import { CustomerMapFeed } from './map/CustomerMapFeed';
import { ProviderMapFeed } from './map/ProviderMapFeed';
import { MapboxComponent } from './shared/MapboxComponent';
import { MapboxCustomerFeed } from './map/MapboxCustomerFeed';
import { MapboxProviderFeed } from './map/MapboxProviderFeed';
import mapboxgl from 'mapbox-gl';

declare var google: any;

const SANDTON_LAT = -26.1076;
const SANDTON_LNG = 28.0567;

const MAP_STYLES = [
    { "featureType": "all", "elementType": "geometry", "stylers": [{ "color": "#f8fafc" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#cbd5e1" }] },
    { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
    { "featureType": "transit", "stylers": [{ "visibility": "off" }] }
];

const USER_LOCATION_HTML = `
  <div class="user-location-container" style="position: relative; width: 24px; height: 24px;">
    <div class="user-location-pulse" style="position: absolute; inset: 0; background: rgba(0, 196, 180, 0.4); border-radius: 50%; animation: user-pulse 2s infinite;"></div>
    <div class="user-location-dot" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; background: #00C4B4; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"></div>
    <style>
      @keyframes user-pulse {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(3.5); opacity: 0; }
      }
    </style>
  </div>
`;

interface MapVizProps {
  isGlobal?: boolean;
}

export const MapViz: React.FC<MapVizProps> = ({ isGlobal = true }) => {
  const { activeRide, view, availableJobs, setSelectedJob, setIsMapReady, user, selectedJob, navigate, nearbyRunners, setSelectedRunner } = useApp();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); 
  const [isTilesLoaded, setIsTilesLoaded] = useState(false);
  const [mapboxInstance, setMapboxInstance] = useState<mapboxgl.Map | null>(null);
  
  const directionsRendererRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const mapboxUserMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const isDiscoveryView = (view === AppView.HOME || view === AppView.DRIVER_HOME) && !activeRide;

  useEffect(() => {
    console.log('MapViz State:', { view, isDiscoveryView, hasActiveRide: !!activeRide });
  }, [view, isDiscoveryView, activeRide]);

  // Handle Mapbox User Location
  useEffect(() => {
    if (isDiscoveryView && mapboxInstance && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        
        if (!mapboxUserMarkerRef.current) {
          const el = document.createElement('div');
          el.innerHTML = USER_LOCATION_HTML;
          mapboxUserMarkerRef.current = new mapboxgl.Marker(el)
            .setLngLat(loc)
            .addTo(mapboxInstance);
            
          // Center map on user location initially
          mapboxInstance.flyTo({ center: loc, zoom: 14, duration: 0 });
        } else {
          mapboxUserMarkerRef.current.setLngLat(loc);
        }
      });
    }
    return () => {
      if (mapboxUserMarkerRef.current) {
        mapboxUserMarkerRef.current.remove();
        mapboxUserMarkerRef.current = null;
      }
    };
  }, [isDiscoveryView, mapboxInstance]);

  useEffect(() => {
    if (isDiscoveryView) return;

    let isMounted = true;

    const initMap = async () => {
        try {
            await loadGoogleMaps();
            if (!isMounted) return;

            if (mapContainerRef.current && !mapInstanceRef.current && typeof window.google !== 'undefined') {
                const map = new window.google.maps.Map(mapContainerRef.current, {
                    center: { lat: SANDTON_LAT, lng: SANDTON_LNG },
                    zoom: 14,
                    mapId: 'DEMO_MAP_ID', // REQUIRED for AdvancedMarkerElement
                    disableDefaultUI: true, 
                    zoomControl: false,
                    mapTypeControl: false,
                    scaleControl: false,
                    streetViewControl: false,
                    rotateControl: false,
                    fullscreenControl: false,
                    styles: MAP_STYLES,
                    backgroundColor: '#f1f5f9',
                    gestureHandling: 'greedy'
                });

                window.google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
                    if(isMounted) setIsTilesLoaded(true);
                });

                directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
                    map,
                    suppressMarkers: true,
                    polylineOptions: { strokeColor: '#00C4B4', strokeWeight: 6 }
                });

                mapInstanceRef.current = map;
                setIsMapReady(true);

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        if (!activeRide) map.setCenter(loc);
                        
                        if (!userMarkerRef.current && window.google.maps.marker) {
                            const container = document.createElement('div');
                            container.innerHTML = USER_LOCATION_HTML;
                            
                            userMarkerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
                                position: loc,
                                map: map,
                                content: container,
                                title: "Your Location",
                                zIndex: 999
                            });
                        }
                    });
                }
            } 
        } catch (err) {
            console.error("Map Init Failed:", err);
        }
    };

    initMap();
    return () => { isMounted = false; };
  }, [isDiscoveryView]);

  const zoomIn = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDiscoveryView && mapboxInstance) {
          mapboxInstance.zoomIn();
      } else if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
      }
  };
  
  const zoomOut = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDiscoveryView && mapboxInstance) {
          mapboxInstance.zoomOut();
      } else if (mapInstanceRef.current) {
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
      }
  };

  const geolocate = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
              const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              if (isDiscoveryView && mapboxInstance) {
                  mapboxInstance.flyTo({ center: [loc.lng, loc.lat], zoom: 16 });
              } else if (mapInstanceRef.current) {
                  mapInstanceRef.current.panTo(loc);
                  mapInstanceRef.current.setZoom(16);
                  if (userMarkerRef.current) {
                      userMarkerRef.current.position = loc;
                  }
              }
          });
      }
  };

  useEffect(() => {
    if (!activeRide || !mapInstanceRef.current || typeof google === 'undefined') {
        if (directionsRendererRef.current) directionsRendererRef.current.setMap(null);
        return;
    }
    directionsRendererRef.current.setMap(mapInstanceRef.current);
    const ds = new google.maps.DirectionsService();
    ds.route({
        origin: { lat: activeRide.pickup.lat, lng: activeRide.pickup.lng },
        destination: { lat: activeRide.dropoff.lat, lng: activeRide.dropoff.lng },
        travelMode: google.maps.TravelMode.DRIVING
    }, (res: any, status: any) => {
        if (status === 'OK') {
            directionsRendererRef.current.setDirections(res);
            mapInstanceRef.current.fitBounds(res.routes[0].bounds, { top: 50, right: 20, bottom: 350, left: 20 });
        }
    });
  }, [activeRide?.id, isDiscoveryView]);

  // CONTROLS VISIBILITY: Removed REQUEST_RIDE and FINDING_RUNNER to avoid overlaps with cards.
  const isDriverWithJob = user?.role === UserRole.DRIVER && activeRide;
  const showControls = [
      AppView.HOME, 
      AppView.DRIVER_HOME,
      AppView.TRACKING
  ].includes(view) && !selectedJob && !isDriverWithJob;

  return (
    <>
        <div className={`${isGlobal ? 'fixed inset-0' : 'absolute inset-0'} z-10`}>
            {isDiscoveryView ? (
                <div className="w-full h-full bg-blue-50">
                    <MapboxComponent 
                        center={{ lat: SANDTON_LAT, lng: SANDTON_LNG }}
                        onLoad={(map) => {
                            setMapboxInstance(map);
                            setIsMapReady(true);
                        }}
                    >
                        {mapboxInstance && (
                            <>
                                {view === AppView.HOME && (
                                    <MapboxCustomerFeed 
                                        map={mapboxInstance} 
                                        runners={nearbyRunners} 
                                        onRunnerSelect={setSelectedRunner} 
                                    />
                                )}
                                {view === AppView.DRIVER_HOME && (
                                    <MapboxProviderFeed 
                                        map={mapboxInstance} 
                                        jobs={availableJobs} 
                                        onJobSelect={setSelectedJob} 
                                    />
                                )}
                            </>
                        )}
                    </MapboxComponent>
                </div>
            ) : (
                <div 
                  ref={mapContainerRef}
                  className="w-full h-full bg-red-50" 
                />
            )}

            {!isDiscoveryView && isTilesLoaded && mapInstanceRef.current && (
                <>
                    {/* Active Phase (Tracking) */}
                    {view === AppView.TRACKING && activeRide && (
                        <>
                            {user?.role === UserRole.CREATOR && activeRide.driver?.id && nearbyRunners[activeRide.driver.id] && (
                                <CustomerMapFeed 
                                    map={mapInstanceRef.current} 
                                    runners={{ [activeRide.driver.id]: nearbyRunners[activeRide.driver.id] }} 
                                />
                            )}
                        </>
                    )}
                </>
            )}
        </div>

        {showControls && (
            <div className="fixed right-4 top-20 z-[45] flex flex-col gap-3 pointer-events-auto animate-fade-in">
                <button 
                    onClick={geolocate} 
                    className="bg-white/95 backdrop-blur-md w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center text-primary active:scale-90 border border-primary/10 transition-all hover:bg-white group"
                    aria-label="Find my location"
                >
                    <Icon name="my_location" className="text-2xl group-hover:scale-110 transition-transform" />
                </button>
                
                <div className="flex flex-col rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl border border-primary/10 overflow-hidden">
                    <button 
                        onClick={zoomIn} 
                        className="w-12 h-12 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 border-b border-slate-100 transition-colors"
                        aria-label="Zoom in"
                    >
                        <Icon name="zoom_in" className="text-2xl" />
                    </button>
                    <button 
                        onClick={zoomOut} 
                        className="w-12 h-12 flex items-center justify-center text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        aria-label="Zoom out"
                    >
                        <Icon name="zoom_out" className="text-2xl" />
                    </button>
                </div>
            </div>
        )}
    </>
  );
};
