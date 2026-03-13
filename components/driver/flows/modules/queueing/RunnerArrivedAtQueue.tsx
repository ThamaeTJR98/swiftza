import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../../Icons';
import { RideStop, RideRequest } from '../../../../../types';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleMapComponent } from '../../../../shared/GoogleMapComponent';
import { Marker, Autocomplete } from '@react-google-maps/api';

interface Props {
    ride: RideRequest;
    currentStop: RideStop;
    onStartQueue: () => void;
    onBack: () => void;
}

export const RunnerArrivedAtQueue: React.FC<Props> = ({ ride, currentStop, onStartQueue, onBack }) => {
  const [isCardOpen, setIsCardOpen] = useState(true);
  const [isIssuesModalOpen, setIsIssuesModalOpen] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zoom, setZoom] = useState(18);
  const [runnerLocation, setRunnerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchResult, setSearchResult] = useState<google.maps.places.PlaceResult | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

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

  useEffect(() => {
      if (map && runnerLocation && currentStop && window.google) {
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(new google.maps.LatLng(runnerLocation.lat, runnerLocation.lng));
          bounds.extend(new google.maps.LatLng(currentStop.lat, currentStop.lng));
          map.fitBounds(bounds, { top: 100, bottom: 400, left: 50, right: 50 });
      }
  }, [map, runnerLocation, currentStop]);

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
        map.setZoom(18);
    }
  };

  const onLoadAutocomplete = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setSearchResult(place);
      if (place.geometry && place.geometry.location && map) {
        map.panTo(place.geometry.location);
        map.setZoom(17);
      }
    }
  };

  const issueOptions = [
      { id: 'closed', label: 'Location is closed', icon: 'storefront' },
      { id: 'moved', label: 'Location has moved', icon: 'wrong_location' },
      { id: 'cant_find', label: 'Cannot find location', icon: 'location_off' },
      { id: 'unsafe', label: 'Area feels unsafe', icon: 'gpp_bad' },
      { id: 'other', label: 'Other issue', icon: 'help_outline' },
  ];

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans">
        {/* Map Background Layer */}
        <div className="absolute inset-0 z-0 bg-slate-200">
             <GoogleMapComponent 
                lat={currentStop.lat}
                lng={currentStop.lng}
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
                <Marker 
                    position={{ lat: currentStop.lat, lng: currentStop.lng }}
                    icon={{
                        path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                        fillColor: "#2563EB",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        strokeColor: "#FFFFFF",
                        scale: 1.5,
                        anchor: new google.maps.Point(12, 24),
                    }}
                    label={{
                        text: "QUEUE",
                        color: "#2563EB",
                        fontWeight: "bold",
                        fontSize: "12px",
                        className: "bg-white px-1 rounded shadow-sm mt-8"
                    }}
                />
                
                {searchResult && searchResult.geometry && searchResult.geometry.location && (
                    <Marker 
                        position={searchResult.geometry.location}
                        icon={{
                            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        }}
                    />
                )}

                {runnerLocation && (
                    <Marker
                        position={runnerLocation}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 7,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "white",
                            strokeWeight: 2,
                        }}
                    />
                )}
            </GoogleMapComponent>
        </div>

        {/* Top Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 pt-safe-top flex items-center justify-between pointer-events-none">
            <button 
                onClick={onBack}
                className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-lg text-slate-700 backdrop-blur-md active:scale-95 transition-transform pointer-events-auto"
            >
                <Icon name="arrow_back" className="text-xl" />
            </button>
            <div className="px-4 py-2 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow-lg tracking-wide backdrop-blur-md pointer-events-auto uppercase">
                Runner Mode
            </div>
        </div>

        {/* Search Bar */}
        <div className="absolute top-20 left-4 right-4 z-10 pointer-events-auto">
            <Autocomplete
                onLoad={onLoadAutocomplete}
                onPlaceChanged={onPlaceChanged}
            >
                <div className="flex w-full items-center rounded-xl h-12 bg-white/95 shadow-lg backdrop-blur-md border border-slate-200/50 overflow-hidden">
                    <div className="text-primary flex items-center justify-center pl-4 pr-3">
                        <Icon name="search" className="text-xl" />
                    </div>
                    <input 
                        className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:outline-none focus:ring-0 px-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 truncate" 
                        placeholder="Search locations..." 
                        defaultValue={currentStop.address}
                    />
                </div>
            </Autocomplete>
        </div>

        {/* Floating Map Controls */}
        <div className={`absolute right-4 transition-all duration-300 z-10 flex flex-col gap-2 ${isCardOpen ? 'bottom-[320px]' : 'bottom-24'}`}>
            <div className="flex flex-col rounded-lg bg-white/90 shadow-lg backdrop-blur-md overflow-hidden border border-slate-200/50 w-10">
                <button onClick={handleZoomIn} className="flex h-10 w-full items-center justify-center hover:bg-slate-100 transition-colors border-b border-slate-200 active:bg-slate-200">
                    <Icon name="add" className="text-slate-700 text-lg" />
                </button>
                <button onClick={handleZoomOut} className="flex h-10 w-full items-center justify-center hover:bg-slate-100 transition-colors active:bg-slate-200">
                    <Icon name="remove" className="text-slate-700 text-lg" />
                </button>
            </div>
            <button onClick={handleGeolocate} className="flex size-10 items-center justify-center rounded-lg bg-white/90 shadow-lg backdrop-blur-md text-primary border border-slate-200/50 active:scale-95 transition-transform">
                <Icon name="my_location" className="text-lg" />
            </button>
        </div>

        {/* Retractable Widget Icon */}
        {!isCardOpen && (
            <button 
                onClick={() => setIsCardOpen(true)}
                className="absolute bottom-6 left-5 size-14 rounded-full bg-primary shadow-lg text-white flex items-center justify-center z-30 animate-in fade-in zoom-in duration-300"
            >
                <Icon name="timer" className="text-2xl" />
            </button>
        )}

        {/* Confirmation Card (Bottom) */}
        <AnimatePresence>
            {isCardOpen && (
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-safe-action"
                >
                    <div className="flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                        <div 
                            className="w-full h-6 flex items-center justify-center cursor-pointer active:bg-slate-50"
                            onClick={() => setIsCardOpen(false)}
                        >
                            <div className="w-10 h-1 bg-slate-200 rounded-full" />
                        </div>

                        <div className="flex flex-col px-5 pb-5 gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                                        <p className="text-slate-500 text-sm font-medium leading-normal">
                                            {ride.errandDetails?.category === 'BANK_QUEUE' ? 'Arrived at Bank' :
                                             ride.errandDetails?.category === 'GOVT_QUEUE' ? 'Arrived at Department' :
                                             'Arrived at Queue Location'}
                                        </p>
                                    </div>
                                    <h1 className="text-slate-900 text-2xl font-bold leading-tight tracking-tight">{currentStop.address.split(',')[0]}</h1>
                                    <p className="text-slate-500 text-sm">{currentStop.address}</p>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                    <Icon name="verified" className="text-sm" />
                                    <span className="text-xs font-bold uppercase tracking-wide">Verified</span>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Queue Instructions</p>
                                <p className="text-sm text-slate-700">{ride.errandDetails?.instructions || 'Join the queue and wait for further instructions.'}</p>
                            </div>

                            <button 
                                onClick={onStartQueue}
                                className="w-full flex h-14 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary text-white text-lg font-bold leading-normal shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
                            >
                                <Icon name="play_arrow" className="mr-2" />
                                <span className="truncate">
                                    {ride.errandDetails?.category === 'BANK_QUEUE' ? 'START BANKING' :
                                     ride.errandDetails?.category === 'GOVT_QUEUE' ? 'START WAITING' :
                                     'START QUEUEING'}
                                </span>
                            </button>
                            <button 
                                onClick={() => setIsIssuesModalOpen(true)}
                                className="w-full text-center text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors py-2"
                            >
                                Issues with arrival? Tap here
                            </button>
                        </div>
                    </div>
                    <div className="h-2"></div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Issues Modal */}
        <AnimatePresence>
            {isIssuesModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center pointer-events-auto"
                    onClick={() => setIsIssuesModalOpen(false)}
                >
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="bg-white w-full rounded-t-3xl p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Report an Issue</h3>
                            <button 
                                onClick={() => setIsIssuesModalOpen(false)}
                                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <Icon name="close" />
                            </button>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            {issueOptions.map((option) => (
                                <button 
                                    key={option.id}
                                    onClick={() => {
                                        alert(`Reported issue: ${option.label}`);
                                        setIsIssuesModalOpen(false);
                                    }}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                                >
                                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                        <Icon name={option.icon} />
                                    </div>
                                    <span className="font-medium text-slate-700">{option.label}</span>
                                    <Icon name="chevron_right" className="ml-auto text-slate-400" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};
