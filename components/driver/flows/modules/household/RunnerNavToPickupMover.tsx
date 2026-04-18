import React, { useState, useEffect } from 'react';
import { Icon } from '../../../../Icons';
import { RideStop, RideRequest } from '../../../../../types';
import { GoogleMapComponent } from '../../../../shared/GoogleMapComponent';
import { motion, AnimatePresence } from "motion/react";
import { DirectionsRenderer } from '@react-google-maps/api';

interface Props {
    ride: RideRequest;
    currentStop: RideStop;
    title?: string;
    onArrive: () => void;
    onCancel: () => void;
}

export const RunnerNavToPickupMover: React.FC<Props> = ({ ride, currentStop, title = "Heading to Pickup", onArrive, onCancel }) => {
  const [sliderVal, setSliderVal] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zoom, setZoom] = useState(15);
  
  // Initialize with a fallback location
  const [moverLocation, setMoverLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Directions State
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{
      distance: string;
      duration: string;
      nextStep: string;
  }>({
      distance: 'Calculating...',
      duration: '...',
      nextStep: 'Proceed to route'
  });

  // Watch Location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setMoverLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error("Error watching location:", error),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Fetch Directions when location or destination changes
  useEffect(() => {
      if (moverLocation && currentStop && window.google) {
          const directionsService = new google.maps.DirectionsService();
          directionsService.route({
              origin: moverLocation,
              destination: { lat: currentStop.lat, lng: currentStop.lng },
              travelMode: google.maps.TravelMode.DRIVING,
          }, (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                  setDirectionsResponse(result);
                  const leg = result.routes[0].legs[0];
                  setRouteInfo({
                      distance: leg.distance?.text || '0 km',
                      duration: leg.duration?.text || '0 min',
                      nextStep: leg.steps[0]?.instructions?.replace(/<[^>]*>?/gm, '') || 'Proceed to destination'
                  });
              } else {
                  console.error(`Directions request failed due to ${status}`);
              }
          });
      }
  }, [moverLocation, currentStop]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderVal(val);
    if (val >= 95) {
        setSliderVal(100);
        onArrive();
    }
  };

  const handleZoomIn = () => {
    if (map) {
        const newZoom = Math.min(map.getZoom()! + 1, 20);
        map.setZoom(newZoom);
        setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (map) {
        const newZoom = Math.max(map.getZoom()! - 1, 2);
        map.setZoom(newZoom);
        setZoom(newZoom);
    }
  };

  const handleGeolocate = () => {
    if (map && moverLocation) {
        map.panTo(moverLocation);
        map.setZoom(17);
    }
  };

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans">
        {/* Map View Container - Full Screen */}
        <div className="absolute inset-0 w-full h-full bg-slate-200 z-0">
            {moverLocation ? (
                <GoogleMapComponent 
                    lat={moverLocation.lat}
                    lng={moverLocation.lng}
                    zoom={zoom} 
                    onLoad={setMap}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: false,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                    }}
                >
                    {directionsResponse && (
                        <DirectionsRenderer 
                            directions={directionsResponse} 
                            options={{
                                suppressMarkers: false,
                                polylineOptions: {
                                    strokeColor: "#F97316", // brand-orange
                                    strokeWeight: 5,
                                    strokeOpacity: 0.8
                                }
                            }}
                        />
                    )}
                </GoogleMapComponent> 
            ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-200">
                    <p className="text-slate-500">Locating Mover...</p>
                </div>
            )}
        </div>

        {/* Header Overlay - High Z-Index for interactivity */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center p-3 pt-safe-top justify-between bg-white/90 backdrop-blur-sm shadow-sm pointer-events-auto">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onCancel();
                }} 
                className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors active:scale-95"
            >
                <Icon name="arrow_back" className="text-xl" />
            </button>
            <div className="flex flex-col items-center pointer-events-none">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Mover</span>
                <span className="text-sm font-bold text-slate-900">{title}</span>
            </div>
            <button 
                className="size-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 cursor-pointer hover:bg-red-100 transition-colors active:scale-95"
            >
                <Icon name="emergency" className="text-xl" />
            </button>
        </div>
            
        {/* Navigation Instruction Card - Positioned to not overlap header */}
        <div className="absolute inset-x-0 top-24 px-3 z-40 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-3 flex items-center gap-3 border border-slate-100 pointer-events-auto">
                <div className="bg-orange-500 text-white p-2 rounded-lg shrink-0">
                    <Icon name="turn_right" className="text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Next Step</p>
                    <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                        {routeInfo.nextStep}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <p className="text-lg font-black text-slate-900">{routeInfo.distance}</p>
                </div>
            </div>
        </div>

        {/* Map Controls */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 pointer-events-auto">
            <button onClick={handleZoomIn} className="flex size-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-md text-slate-700 active:scale-95 transition-transform">
                <Icon name="add" />
            </button>
            <button onClick={handleZoomOut} className="flex size-10 items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-md text-slate-700 active:scale-95 transition-transform">
                <Icon name="remove" />
            </button>
            <button onClick={handleGeolocate} className="flex size-10 items-center justify-center rounded-xl bg-orange-500 shadow-md text-white mt-1 active:scale-95 transition-transform">
                <Icon name="my_location" />
            </button>
        </div>

        {/* Retractable Widget Icon */}
        {!isOpen && (
            <button 
                onClick={() => setIsOpen(true)}
                className="absolute bottom-6 left-5 size-14 rounded-full bg-orange-500 shadow-lg text-white flex items-center justify-center z-40 pointer-events-auto active:scale-95 transition-transform animate-in fade-in zoom-in duration-300"
            >
                <Icon name="local_shipping" className="text-2xl" />
            </button>
        )}

        {/* Bottom Arrival Panel */}
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="absolute bottom-0 left-0 right-0 z-50 bg-white px-5 pt-2 pb-safe-action rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-100 pointer-events-auto"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    <div onClick={() => setIsOpen(false)} className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-2 cursor-pointer active:bg-slate-300 transition-colors"></div>
                    
                    <div className="flex items-start justify-between mb-4 mt-2">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">{currentStop.customerName || ride.passenger?.name || 'Pickup Location'}</h2>
                                <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-orange-200">Mover</span>
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                                <p className="text-slate-500 text-xs font-bold flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md w-fit">
                                    <Icon name="location_on" className="text-xs" />
                                    {currentStop.address}
                                </p>
                                <div className="flex items-center gap-4">
                                    <p className="text-slate-500 text-xs font-bold flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                        <Icon name="timer" className="text-xs" />
                                        ETA: <span className="text-slate-900">{routeInfo.duration}</span>
                                    </p>
                                    <p className="text-slate-500 text-xs font-bold flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                        <Icon name="straighten" className="text-xs" />
                                        Dist: <span className="text-slate-900">{routeInfo.distance}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Details Section */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Items</p>
                            <p className="text-xs font-bold text-slate-900">{ride.errandDetails?.items?.length || 0} Units</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Size</p>
                            <p className="text-xs font-bold text-slate-900 capitalize">{ride.errandDetails?.packageSize || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Earnings</p>
                            <p className="text-xs font-bold text-teal-600">R {ride.price.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Slide to Arrive Button */}
                    <div className="relative w-full h-16 bg-slate-100 rounded-2xl p-1.5 flex items-center group cursor-pointer border border-slate-200 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <span className="text-slate-400 font-black text-sm uppercase tracking-[0.2em] ml-8 group-hover:text-slate-500 transition-colors">Slide to Arrive</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={sliderVal}
                            onChange={handleSliderChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                        />
                        <div 
                            className="h-full aspect-square bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 z-20 transition-transform duration-75 ease-out"
                            style={{ transform: `translateX(${sliderVal * (window.innerWidth - 40 - 12 - 56) / 100}px)` }} // Approximate width calc
                        >
                            <Icon name="keyboard_double_arrow_right" className="text-2xl" />
                        </div>
                        <div 
                            className="absolute inset-y-1.5 left-1.5 rounded-xl bg-orange-500/10 z-10 pointer-events-none transition-all duration-75 ease-out"
                            style={{ width: `calc(${sliderVal}% + 48px)` }}
                        ></div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

