import React from 'react';
import { Icon } from '../../../../Icons';
import { RideStop } from '../../../../../types';

interface Props {
    stops: RideStop[];
    currentStopIndex: number;
    onStartRoute: () => void;
}

export const MultiStopRoutingOverview: React.FC<Props> = ({ stops, currentStopIndex, onStartRoute }) => {
  return (
    <div className="flex flex-col h-full p-6 animate-slide-up">
        <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Route Overview</h2>
            <p className="text-sm text-slate-500 mt-2">You have {stops.length} stops for this business errand.</p>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200 z-0"></div>

            {stops.map((stop, idx) => {
                const isCompleted = idx < currentStopIndex;
                const isCurrent = idx === currentStopIndex;
                
                return (
                    <div key={stop.id} className="relative z-10 flex gap-4">
                        <div className={`size-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white ${isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-brand-teal text-slate-900' : 'bg-slate-200 text-slate-400'}`}>
                            {isCompleted ? <Icon name="check" /> : <span className="font-bold">{idx + 1}</span>}
                        </div>
                        <div className={`flex-1 p-4 rounded-2xl border ${isCurrent ? 'bg-white border-brand-teal shadow-lg' : 'bg-slate-50 border-slate-100'}`}>
                            <p className="font-bold text-slate-900">{stop.address}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{stop.type}</p>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="mt-auto pt-8">
            <button 
                onClick={onStartRoute}
                className="w-full h-16 bg-brand-teal text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-teal/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Icon name="navigation" />
                Start Route
            </button>
        </div>
    </div>
  );
};
