import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../../../Icons';
import { RideRequest } from '../../../../../types';
import { RunnerAbandonQueueReason } from './RunnerAbandonQueueReason';
import { supabase } from '../../../../../lib/supabase';

interface Props {
    startTime: number;
    baseRatePerMin: number;
    onFinishQueue: () => void;
    onAbandonQueue: (reason?: string) => void;
    ride: RideRequest;
}

export const RunnerActiveQueueTimer: React.FC<Props> = ({ startTime, baseRatePerMin, onFinishQueue, onAbandonQueue, ride }) => {
  const [elapsed, setElapsed] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<'VERIFIED' | 'CHECKING' | 'WARNING' | 'CRITICAL'>('CHECKING');
  const [lastVerified, setLastVerified] = useState<Date>(new Date());
  const [proofs, setProofs] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Target Location (Queue Spot)
  const targetLat = ride.stops?.[0]?.lat || ride.pickup.lat;
  const targetLng = ride.stops?.[0]?.lng || ride.pickup.lng;
  const locationName = ride.stops?.[0]?.address.split(',')[0] || ride.pickup.address.split(',')[0];

  // Haversine formula to calculate distance in meters
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3; // metres
      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      return R * c;
  };

  // Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Live GPS Logic
  useEffect(() => {
    if (!navigator.geolocation) {
        setGpsStatus('CRITICAL');
        return;
    }

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            const dist = getDistance(currentLat, currentLng, targetLat, targetLng);
            
            setDistance(dist);

            // Strict 50m geofence for queueing
            if (dist <= 50) {
                setGpsStatus('VERIFIED');
                setLastVerified(new Date());
            } else if (dist <= 100) {
                setGpsStatus('WARNING');
            } else {
                setGpsStatus('CRITICAL');
            }
        },
        (error) => {
            console.error("GPS Error:", error);
            setGpsStatus('CRITICAL');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000
        }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [targetLat, targetLng]);

  const handlePhotoClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
          const fileName = `${ride.id}/${Date.now()}_proof.jpg`;
          const { data, error } = await supabase.storage
              .from('queue_proofs')
              .upload(fileName, file);

          if (error) throw error;

          // In a real app, we would also save this metadata to a 'queue_logs' table
          console.log("Proof uploaded:", data);
          setProofs(prev => prev + 1);
          alert("Photo proof uploaded successfully!");
      } catch (error) {
          console.error("Upload failed:", error);
          alert("Failed to upload photo proof. Please try again.");
      } finally {
          setIsUploading(false);
          // Reset input
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  const cost = (elapsed / 60) * baseRatePerMin;

  if (showAbandonModal) {
      return (
          <RunnerAbandonQueueReason 
            progress={Math.min(100, Math.floor((elapsed / 3600) * 100))} // Mock progress based on 1 hour goal
            timeStarted={new Date(startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            timeLeft="Unknown"
            payout={cost}
            onConfirm={(reason) => {
                console.log("Abandon Reason:", reason);
                onAbandonQueue(reason);
            }}
            onCancel={() => setShowAbandonModal(false)}
          />
      );
  }

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#f8f6f6] text-slate-900 font-sans animate-slide-up">
        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            capture="environment"
            className="hidden" 
            onChange={handleFileChange}
        />

        {/* Compact Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0 z-10">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setShowAbandonModal(true)}
                    className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Icon name="arrow_back" className="text-xl" />
                </button>
                <div>
                    <h1 className="text-base font-bold tracking-tight leading-none">
                        {ride.errandDetails?.category === 'BANK_QUEUE' ? 'Banking Queue' :
                         ride.errandDetails?.category === 'GOVT_QUEUE' ? 'Government Queue' :
                         ride.errandDetails?.category === 'FORM_SUBMISSION' ? 'Submission Queue' :
                         'Active Queue'}
                    </h1>
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">{locationName}</p>
                </div>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
                gpsStatus === 'VERIFIED' 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : gpsStatus === 'WARNING'
                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                    : gpsStatus === 'CRITICAL'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
                <div className={`size-2 rounded-full ${
                    gpsStatus === 'VERIFIED' ? 'bg-green-500 animate-pulse' : 
                    gpsStatus === 'WARNING' ? 'bg-yellow-500 animate-bounce' : 
                    gpsStatus === 'CRITICAL' ? 'bg-red-500 animate-ping' : 'bg-slate-400'
                }`} />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                    {gpsStatus === 'VERIFIED' ? 'GPS LIVE' : gpsStatus === 'WARNING' ? 'DRIFTING' : gpsStatus === 'CRITICAL' ? 'OFF SITE' : 'CHECKING'}
                </span>
            </div>
        </header>

        {/* Main Content - Flex Grow to fill space without scroll if possible */}
        <main className="flex-1 flex flex-col px-4 py-2 gap-2 overflow-y-auto">
            
            {/* Timer & Earnings Combined Card */}
            <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 shrink-0">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Elapsed</span>
                        <div className="text-5xl font-black tracking-tighter text-slate-900 font-sans leading-none mt-1">
                            {hours}:{minutes}<span className="text-2xl text-slate-400 font-medium">.{seconds}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Earnings</span>
                        <div className="text-3xl font-bold text-orange-500 leading-none mt-1">
                            R {cost.toFixed(2)}
                        </div>
                    </div>
                </div>
                
                {/* Mini Stats Bar */}
                <div className="flex items-center gap-4 pt-3 mt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                        <Icon name="trending_up" className="text-xs text-slate-400" />
                        <p className="text-xs font-semibold text-slate-600">R {baseRatePerMin.toFixed(2)} / min</p>
                    </div>
                    <div className="w-px h-3 bg-slate-200"></div>
                    <div className="flex items-center gap-1.5">
                        <Icon name="my_location" className="text-xs text-slate-400" />
                        <p className="text-xs font-semibold text-slate-600">Accuracy: {distance < 10 ? '<10m' : `~${Math.round(distance)}m`}</p>
                    </div>
                </div>
            </section>

            {/* Smart Queue Actions */}
            <div className="grid grid-cols-2 gap-2 shrink-0">
                <button 
                    onClick={handlePhotoClick}
                    disabled={isUploading}
                    className="bg-slate-100 hover:bg-slate-200 p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                    <div className="bg-white p-2 rounded-full shadow-sm">
                        {isUploading ? (
                            <div className="size-5 border-2 border-slate-300 border-t-brand-teal rounded-full animate-spin"></div>
                        ) : (
                            <Icon name="camera_alt" className="text-slate-700" />
                        )}
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                        {isUploading ? 'Uploading...' : 'Add Photo Proof'}
                    </span>
                    <span className="text-[10px] text-slate-400">{proofs} uploaded</span>
                </button>

                <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-1">
                    <div className={`p-2 rounded-full shadow-sm ${gpsStatus === 'VERIFIED' ? 'bg-green-100 text-green-600' : gpsStatus === 'WARNING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                        <Icon name={gpsStatus === 'VERIFIED' ? 'verified_user' : 'gpp_bad'} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">
                        {gpsStatus === 'VERIFIED' ? 'Anti-Cheat Active' : 'Check Position'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                        {gpsStatus === 'VERIFIED' ? 'Geofence Secured' : 'Return to Queue'}
                    </span>
                </div>
            </div>

            {/* Production Note (Collapsible or Small) */}
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl shrink-0">
                <div className="flex gap-2">
                    <Icon name="security" className="text-blue-500 text-sm mt-0.5" />
                    <div>
                        <p className="text-[10px] font-bold text-blue-700 uppercase mb-0.5">Anti-Cheat Protocols</p>
                        <p className="text-[10px] text-blue-600 leading-snug">
                            1. <span className="font-bold">Geofencing:</span> Must stay within 50m of {locationName}.<br/>
                            2. <span className="font-bold">Liveness:</span> Random photo challenges may appear.<br/>
                            3. <span className="font-bold">Metadata:</span> All uploads are EXIF-verified.
                        </p>
                    </div>
                </div>
            </div>

            {/* Spacer to push buttons to bottom if space allows */}
            <div className="flex-1 min-h-4"></div>

            {/* Action Buttons - Fixed at bottom of flex container */}
            <div className="flex flex-col gap-2 pb-2 mt-auto shrink-0">
                <button 
                    onClick={onFinishQueue}
                    className="w-full bg-brand-teal text-slate-900 font-black py-3.5 rounded-xl shadow-lg shadow-brand-teal/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                    <Icon name="notifications_active" className="text-slate-900" />
                    {[
                        'GOVT_QUEUE', 
                        'BANK_QUEUE', 
                        'FORM_SUBMISSION', 
                        'OFFICE_ADMIN', 
                        'BANKING_ERRAND'
                    ].includes(ride.errandDetails?.category || '')
                        ? 'Arrived at Counter' 
                        : 'Arrived at Cashier'}
                </button>
                <button 
                    onClick={() => setShowAbandonModal(true)}
                    className="w-full bg-slate-200 text-slate-600 font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                    ABANDON QUEUE
                </button>
            </div>
        </main>
    </div>
  );
};
