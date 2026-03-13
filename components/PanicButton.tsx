import React, { useState } from 'react';
import { Icon } from './Icons';
import { SafetyService } from '../services/SafetyService';
import { useApp } from '../context/AppContext';

interface PanicButtonProps {
  rideId?: string;
  className?: string;
  mini?: boolean;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ rideId, className, mini }) => {
  const { user } = useApp();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);

  const handlePanic = async () => {
    if (!user) return;
    
    setIsTriggered(true);
    try {
      // Get current location
      const pos = await new Promise<GeolocationPosition>((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
      });

      await SafetyService.triggerPanic(user.id, rideId, {
        address: 'Current Location',
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
      
      alert("EMERGENCY ALERT SENT. Security services have been notified of your location.");
    } catch (e) {
      alert("Failed to send alert. Please call 10111 immediately.");
    } finally {
      setIsConfirming(false);
      setTimeout(() => setIsTriggered(false), 5000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {!isConfirming ? (
        <button 
          onClick={() => setIsConfirming(true)}
          className={`${mini ? 'w-10 h-10' : 'w-14 h-14'} bg-red-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20 active:scale-90 transition-all group`}
        >
          <Icon name="emergency" className={`text-white ${mini ? 'text-lg' : 'text-2xl'} group-hover:animate-pulse`} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping opacity-50"></div>
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/10">
            Confirm Emergency?
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsConfirming(false)}
              className="w-12 h-12 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center active:scale-90"
            >
              <Icon name="close" />
            </button>
            <button 
              onClick={handlePanic}
              disabled={isTriggered}
              className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xl active:scale-90 animate-pulse"
            >
              {isTriggered ? <Icon name="sync" className="animate-spin" /> : <Icon name="check" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
