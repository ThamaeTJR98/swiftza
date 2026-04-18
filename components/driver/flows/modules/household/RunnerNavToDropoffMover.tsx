import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../../../Icons';
import { RideStop, RideRequest } from '../../../../../types';
import { GoogleMapComponent } from '../../../../shared/GoogleMapComponent';
import { DirectionsRenderer } from '@react-google-maps/api';

interface Props {
    ride: RideRequest;
    currentStop: RideStop;
    onArrive: () => void;
    onCancel: () => void;
}

export const RunnerNavToDropoffMover: React.FC<Props> = ({ ride, currentStop, onArrive, onCancel }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [nextStep, setNextStep] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Track user location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => console.error("Error watching location:", error),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Calculate directions
  useEffect(() => {
    if (userLocation && currentStop.lat && currentStop.lng) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: { lat: currentStop.lat, lng: currentStop.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const route = result.routes[0].legs[0];
            setDistance(route.distance?.text || '');
            setDuration(route.duration?.text || '');
            setNextStep(route.steps[0].instructions.replace(/<[^>]*>?/gm, ''));
          }
        }
      );
    }
  }, [userLocation, currentStop]);

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-50">
      {/* Header - Floating */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <button 
            onClick={onCancel}
            className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform active:scale-90"
          >
            <Icon name="arrow_back" className="text-slate-600" />
          </button>
          
          <div className="flex-1 mx-4">
            <div className="bg-white/90 rounded-2xl p-3 shadow-lg backdrop-blur-sm border border-white/20">
              <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest text-center">Heading to Drop-off</p>
              <p className="text-xs font-bold text-slate-900 truncate text-center">{currentStop.address}</p>
            </div>
          </div>

          <button className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
            <Icon name="more_vert" className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Map Background */}
      <div className="absolute inset-0 z-0">
        <GoogleMapComponent
          lat={userLocation?.lat || currentStop.lat || 0}
          lng={userLocation?.lng || currentStop.lng || 0}
          zoom={15}
          onLoad={handleMapLoad}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#F27D26',
                  strokeWeight: 6,
                  strokeOpacity: 0.8
                }
              }}
            />
          )}
        </GoogleMapComponent>
      </div>

      {/* Turn-by-Turn Navigator Card - Non-overlapping with header */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-4 right-4 z-20"
          >
            <div className="bg-slate-900/95 text-white rounded-2xl p-4 shadow-2xl border border-white/10 backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="bg-brand-orange rounded-xl p-3 shadow-lg shadow-brand-orange/20">
                  <Icon name="navigation" className="text-2xl rotate-45" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">Next Step</p>
                  <p className="text-lg font-bold leading-tight line-clamp-2" dangerouslySetInnerHTML={{ __html: nextStep || 'Calculating route...' }} />
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Icon name="straighten" className="text-xs text-slate-400" />
                      <span className="text-xs font-bold text-slate-300">{distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="schedule" className="text-xs text-slate-400" />
                      <span className="text-xs font-bold text-slate-300">{duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls */}
      <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-3">
        <button className="flex size-12 items-center justify-center rounded-2xl bg-white shadow-xl border border-slate-200 text-slate-600 active:scale-95 transition-all">
          <Icon name="my_location" />
        </button>
        <div className="flex flex-col rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
          <button className="flex size-12 items-center justify-center text-slate-600 hover:bg-slate-50 border-b border-slate-100 active:scale-95 transition-all">
            <Icon name="add" />
          </button>
          <button className="flex size-12 items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-95 transition-all">
            <Icon name="remove" />
          </button>
        </div>
      </div>

      {/* Retractable Bottom Card */}
      <AnimatePresence>
        {isCollapsed ? (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsCollapsed(false)}
            className="absolute bottom-6 left-6 z-40 flex size-14 items-center justify-center rounded-2xl bg-brand-orange text-white shadow-2xl shadow-brand-orange/40 active:scale-90 transition-all"
          >
            <Icon name="expand_less" className="text-2xl" />
          </motion.button>
        ) : (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-40 pb-safe-action"
          >
            <div className="bg-white rounded-t-[2.5rem] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-slate-100">
              {/* Handle */}
              <button 
                onClick={() => setIsCollapsed(true)}
                className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-200 active:scale-95 transition-all"
              />

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                    <h3 className="text-lg font-bold text-slate-900 truncate">{currentStop.address}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-[10px] font-bold text-teal-600 uppercase tracking-tighter">Goods Secured</span>
                      <span className="text-xs font-bold text-slate-500">{duration} away</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 active:scale-90 transition-all">
                      <Icon name="call" />
                    </button>
                    <button className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 active:scale-90 transition-all">
                      <Icon name="chat" />
                    </button>
                  </div>
                </div>

                {/* Job Details Section */}
                <div className="grid grid-cols-3 gap-2">
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

                {/* Slide to Arrive - Simplified for now as a button but styled like a slider */}
                <button 
                  onClick={onArrive}
                  className="group relative flex h-16 w-full items-center justify-center overflow-hidden rounded-2xl bg-brand-orange text-white shadow-lg shadow-brand-orange/20 active:scale-[0.98] transition-all"
                >
                  <div className="absolute left-2 flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md group-active:translate-x-full transition-transform duration-500">
                    <Icon name="chevron_right" className="text-2xl" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest">Slide to Arrive</span>
                </button>
              </div>
              
              {/* Safe Area */}
              <div className="h-6"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
