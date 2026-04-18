import React from 'react';
import { Icon } from '../../../../Icons';
import { RideStop } from '../../../../../types';
import { GoogleMapComponent } from '../../../../shared/GoogleMapComponent';

interface Props {
    currentStop: RideStop;
    onArrive: () => void;
    onCancel: () => void;
}

export const RunnerNavToBusiness: React.FC<Props> = ({ currentStop, onArrive, onCancel }) => {
  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden animate-slide-up bg-slate-50">
        <div className="p-6 bg-white border-b border-slate-200 z-10">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Business Run</h2>
            <p className="text-sm text-slate-500 mt-2">Next Stop: {currentStop.address}</p>
        </div>
        
        <div className="flex-1 relative flex items-center justify-center overflow-y-auto">
            <GoogleMapComponent lat={currentStop.lat} lng={currentStop.lng} />
            <div className="absolute z-10 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl text-center max-w-[80%]">
                <Icon name="business_center" className="text-4xl text-brand-teal mb-2" />
                <p className="text-lg font-bold text-slate-900">15 mins away</p>
                <p className="text-xs text-slate-500">5.8 km</p>
            </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-200 space-y-4 z-10">
            <button 
                onClick={onArrive}
                className="w-full h-16 bg-brand-teal text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-teal/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Icon name="location_on" />
                Arrived at Stop
            </button>
            <button 
                onClick={onCancel}
                className="w-full h-14 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase tracking-widest text-xs active:scale-95 transition-all"
            >
                Cancel Errand
            </button>
        </div>
    </div>
  );
};
