import React from 'react';
import { Icon } from '../../../../Icons';
import { RideRequest, RideStop } from '../../../../../types';

interface Props {
  ride: RideRequest;
  stops: RideStop[];
  currentStopIndex: number;
  onNavigate: () => void;
  onConfirmArrival: () => void;
}

export const MultiStopNavigation: React.FC<Props> = ({ ride, stops, currentStopIndex, onNavigate, onConfirmArrival }) => {
  const currentStop = stops[currentStopIndex];
  
  return (
    <div className="bg-slate-50 text-slate-900 h-[100dvh] flex flex-col font-sans overflow-hidden animate-slide-up">
      {/* Header */}
      <header className="shrink-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold leading-tight tracking-tight">Move #{ride.id.slice(-4)}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-brand-orange/10 rounded-full">
          <Icon name="alt_route" className="text-brand-orange text-sm" />
          <span className="text-brand-orange text-[10px] font-bold uppercase tracking-wider">Multi-Stop</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {/* Map Section */}
        <div className="p-4">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-200">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/map/800/450')" }}></div>
            
            {/* Map Overlay Info */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm p-3 rounded-xl flex items-center justify-between shadow-lg border border-slate-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-10 rounded-full bg-brand-orange flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-orange/20">
                  <Icon name="navigation" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Next Destination</p>
                  <p className="text-sm font-bold truncate">{currentStop?.address || 'Loading...'}</p>
                </div>
              </div>
              <button 
                onClick={onNavigate}
                className="bg-brand-orange text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest active:scale-95 transition-all"
              >
                Navigate
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="px-4 pb-8 mt-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Icon name="receipt_long" className="text-brand-orange text-base" />
            Move Timeline
          </h2>
          
          <div className="relative pl-2">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
            
            {stops.map((stop, index) => {
                const isCompleted = index < currentStopIndex;
                const isActive = index === currentStopIndex;
                const isFuture = index > currentStopIndex;

                return (
                    <div key={stop.id} className="relative flex gap-4 mb-8 last:mb-0">
                        <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-all ${
                            isCompleted ? 'bg-green-500 text-white' : 
                            isActive ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20' : 
                            'bg-slate-200 text-slate-400'
                        }`}>
                            <Icon name={isCompleted ? "check" : isActive ? "local_shipping" : "location_on"} className={isActive ? "animate-pulse" : ""} />
                        </div>
                        <div className="flex flex-col pt-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                                    isCompleted ? 'text-green-500' : 
                                    isActive ? 'text-brand-orange' : 
                                    'text-slate-400'
                                }`}>
                                    {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Upcoming'}
                                </span>
                            </div>
                            <h3 className={`text-sm font-bold truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                Stop {index + 1}: {stop.type === 'PICKUP' ? 'Pickup' : stop.type === 'DROPOFF' ? 'Drop-off' : 'Intermediate'}
                            </h3>
                            <p className={`text-xs truncate ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                                {stop.address}
                            </p>
                            
                            {isActive && (
                                <div className="mt-4 p-4 bg-brand-orange/5 rounded-xl border border-brand-orange/10">
                                    <p className="text-[10px] text-brand-orange font-bold uppercase tracking-widest mb-2">Current Stop Action</p>
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        Navigate to this location and confirm arrival once on-site.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      </main>

      {/* Earnings Card Footer */}
      <footer className="shrink-0 p-4 pb-8 bg-white border-t border-slate-200 space-y-4">
        {currentStop && (
            <button 
                onClick={onConfirmArrival}
                className="w-full h-14 bg-brand-orange text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-lg shadow-brand-orange/25 active:scale-[0.98] transition-all"
            >
                <Icon name="check_circle" className="text-xl" />
                <span>Confirm Arrival at Stop {currentStopIndex + 1}</span>
            </button>
        )}
        <div className="bg-brand-orange/5 border border-brand-orange/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-brand-orange uppercase tracking-widest">Est. Earnings</p>
            <p className="text-xl font-black text-slate-900">R {ride.price.toFixed(2)}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 flex items-center justify-center">
            <Icon name="payments" className="text-brand-orange text-2xl" />
          </div>
        </div>
      </footer>
    </div>
  );
};
