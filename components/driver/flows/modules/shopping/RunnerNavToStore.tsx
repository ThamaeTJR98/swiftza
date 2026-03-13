import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../../Icons';
import { RideStop, ErrandItem } from '../../../../../types';
import { GoogleMapComponent } from '../../../../shared/GoogleMapComponent';
import { motion, AnimatePresence } from "motion/react";
import { DirectionsRenderer, DirectionsService } from '@react-google-maps/api';

interface Props {
    currentStop: RideStop;
    items: ErrandItem[];
    onArrive: () => void;
    onBack: () => void;
}

export const RunnerNavToStore: React.FC<Props> = ({ currentStop, items, onArrive, onBack }) => {
  const [sliderVal, setSliderVal] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [isListOpen, setIsListOpen] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zoom, setZoom] = useState(15);
  
  // Initialize with a fallback location
  const [runnerLocation, setRunnerLocation] = useState<{ lat: number; lng: number } | null>({
      lat: currentStop.lat - 0.01,
      lng: currentStop.lng - 0.01
  });

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
        setRunnerLocation({
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
      if (runnerLocation && currentStop && window.google) {
          const directionsService = new google.maps.DirectionsService();
          directionsService.route({
              origin: runnerLocation,
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
  }, [runnerLocation, currentStop]);

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
    if (map && runnerLocation) {
        map.panTo(runnerLocation);
        map.setZoom(17);
    }
  };

  const totalOrderValue = items.reduce((acc, item) => {
      const qty = parseInt(item.quantity) || 1;
      const price = item.estimatedPrice || item.actualPrice || 0;
      return acc + (price * qty);
  }, 0);

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans">
        {/* Map View Container - Full Screen */}
        <div className="absolute inset-0 w-full h-full bg-slate-200 z-0">
            {runnerLocation ? (
                <GoogleMapComponent 
                    lat={runnerLocation.lat}
                    lng={runnerLocation.lng}
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
                                    strokeColor: "#2563EB",
                                    strokeWeight: 5,
                                    strokeOpacity: 0.8
                                }
                            }}
                        />
                    )}
                </GoogleMapComponent> 
            ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-200">
                    <p className="text-slate-500">Locating...</p>
                </div>
            )}
        </div>

        {/* Header Overlay - High Z-Index for interactivity */}
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center p-3 pt-safe-top justify-between bg-white/90 backdrop-blur-sm shadow-sm pointer-events-auto">
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onBack();
                }} 
                className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 cursor-pointer hover:bg-slate-200 transition-colors active:scale-95"
            >
                <Icon name="arrow_back" className="text-xl" />
            </button>
            <div className="flex flex-col items-center pointer-events-none">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Runner</span>
                <span className="text-sm font-bold text-slate-900">Heading to Store</span>
            </div>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsListOpen(true);
                }}
                className="size-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-900 cursor-pointer hover:bg-slate-200 transition-colors active:scale-95 relative"
            >
                <Icon name="shopping_cart" className="text-xl" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    {items.length}
                </span>
            </button>
        </div>
            
        {/* Navigation Instruction Card */}
        <div className="absolute inset-x-0 top-20 px-3 z-40 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg p-3 flex items-center gap-3 border border-slate-100 pointer-events-auto">
                <div className="bg-primary text-white p-2 rounded-lg shrink-0">
                    <Icon name="turn_right" className="text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Next Turn</p>
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
            <button onClick={handleGeolocate} className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-md text-white mt-1 active:scale-95 transition-transform">
                <Icon name="my_location" />
            </button>
        </div>

        {/* Retractable Widget Icon */}
        {!isOpen && (
            <button 
                onClick={() => setIsOpen(true)}
                className="absolute bottom-6 left-5 size-14 rounded-full bg-primary shadow-lg text-white flex items-center justify-center z-40 pointer-events-auto active:scale-95 transition-transform animate-in fade-in zoom-in duration-300"
            >
                <Icon name="shopping_bag" className="text-2xl" />
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
                    
                    <div className="flex items-start justify-between mb-6 mt-2">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">{currentStop.customerName || 'Store'}</h2>
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border border-emerald-200">Open</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-slate-500 text-xs font-bold flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                    <Icon name="location_on" className="text-xs" />
                                    {routeInfo.distance} • {routeInfo.duration}
                                </p>
                                <p className="text-slate-500 text-xs font-bold flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md">
                                    <Icon name="payments" className="text-xs" />
                                    Total: <span className="text-slate-900">R {totalOrderValue.toFixed(2)}</span>
                                </p>
                            </div>
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
                            className="h-full aspect-square bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 z-20 transition-transform duration-75 ease-out"
                            style={{ transform: `translateX(${sliderVal * (window.innerWidth - 40 - 12 - 56) / 100}px)` }} // Approximate width calc
                        >
                            <Icon name="keyboard_double_arrow_right" className="text-2xl" />
                        </div>
                        <div 
                            className="absolute inset-y-1.5 left-1.5 rounded-xl bg-primary/10 z-10 pointer-events-none transition-all duration-75 ease-out"
                            style={{ width: `calc(${sliderVal}% + 48px)` }}
                        ></div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Items List Modal */}
        <AnimatePresence>
            {isListOpen && (
                <motion.div
                    className="absolute inset-0 z-[60] bg-white flex flex-col"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
                        <div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Order Items</h2>
                            <p className="text-xs text-slate-500 font-medium">{items.length} items to shop</p>
                        </div>
                        <button 
                            onClick={() => setIsListOpen(false)}
                            className="size-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            <Icon name="close" className="text-xl" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 pb-24">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                                <Icon name="shopping_cart" className="text-4xl mb-2" />
                                <p className="text-sm font-bold">No items in this order</p>
                            </div>
                        ) : (
                            <>
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
                                        <div className="size-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                            <Icon name="shopping_bag" className="text-xl" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-bold text-slate-900 truncate pr-2">{item.name}</p>
                                                <p className="text-sm font-bold text-slate-900 whitespace-nowrap">
                                                    R {(item.estimatedPrice || item.actualPrice || 0).toFixed(2)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                    Qty: {item.quantity}
                                                </span>
                                                {item.brand && (
                                                    <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                                                        {item.brand}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Estimated</span>
                                    <span className="text-xl font-black text-slate-900">R {totalOrderValue.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};
