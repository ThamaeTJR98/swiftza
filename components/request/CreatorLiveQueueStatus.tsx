import React, { useState, useEffect } from 'react';
import { Icon } from '../Icons';
import { RideRequest } from '../../types';
import { GoogleMapComponent } from '../shared/GoogleMapComponent';

interface Props {
  ride: RideRequest;
}

export const CreatorLiveQueueStatus: React.FC<Props> = ({ ride }) => {
  const [elapsed, setElapsed] = useState(0);
  // Mock start time for demo purposes. In production, this should come from the ride details.
  const startTime = Date.now() - 45 * 60 * 1000; // 45 minutes ago
  const baseRatePerMin = 2.5;

  useEffect(() => {
    const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  const cost = (elapsed / 60) * baseRatePerMin;

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-x-hidden bg-[#f8f6f6] text-slate-900 font-sans animate-slide-up">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Icon name="arrow_back" />
            </button>
            <h1 className="text-lg font-bold tracking-tight">Queue Status</h1>
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Icon name="more_vert" />
            </button>
        </header>

        {/* Map Area */}
        <div className="h-[30vh] w-full relative bg-slate-200">
            {ride.stops && ride.stops.length > 0 && (
                <GoogleMapComponent lat={ride.stops[0].lat} lng={ride.stops[0].lng} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#f8f6f6] to-transparent pointer-events-none"></div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col px-4 -mt-10 relative z-10 gap-4 pb-24">
            
            {/* Runner Profile Card */}
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="size-12 rounded-full bg-slate-200 overflow-hidden border-2 border-orange-500">
                            <img src={ride.driver?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ride.driver?.id}`} alt="Runner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 size-4 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{ride.driver?.name || 'Runner'}</h3>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                            <Icon name="star" className="text-[10px] text-orange-500" /> 4.9 • Runner
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="size-10 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center hover:bg-orange-500/20 transition-colors">
                        <Icon name="chat_bubble" className="text-sm" />
                    </button>
                    <button className="size-10 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center hover:bg-orange-500/20 transition-colors">
                        <Icon name="call" className="text-sm" />
                    </button>
                </div>
            </div>

            {/* Live Timer Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full mb-4">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    <span className="text-[10px] font-bold tracking-widest uppercase">Live Queueing</span>
                </div>

                <div className="text-6xl font-bold tracking-tighter text-slate-900 font-sans flex items-baseline gap-1">
                    {hours}:{minutes}<span className="text-2xl text-slate-400">.{seconds}</span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Time Elapsed</p>

                <div className="w-full h-[1px] bg-slate-100 my-6"></div>

                <div className="w-full flex justify-between items-center">
                    <div className="flex flex-col">
                        <p className="text-xs text-slate-500 font-medium">Estimated Cost</p>
                        <p className="text-xl font-bold text-slate-900">R {cost.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-xs text-slate-500 font-medium">Rate</p>
                        <p className="text-sm font-bold text-slate-700">R {baseRatePerMin.toFixed(2)}/min</p>
                    </div>
                </div>
            </div>

            {/* Location Details */}
            <div className="bg-slate-100 p-4 rounded-xl flex items-start gap-4 border border-slate-200">
                <div className="bg-white h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                    <Icon name="location_on" className="text-slate-600 text-sm" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Current Location</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{ride.stops?.[0]?.address.split(',')[0] || 'Location'}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ride.stops?.[0]?.address || 'Address'}</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                <button className="bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
                    <Icon name="receipt_long" className="text-lg" />
                    View Details
                </button>
                <button className="bg-slate-100 text-red-500 font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm">
                    <Icon name="cancel" className="text-lg" />
                    Cancel
                </button>
            </div>
        </main>
    </div>
  );
};
