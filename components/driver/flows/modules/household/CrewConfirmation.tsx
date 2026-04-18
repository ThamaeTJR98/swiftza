import React, { useState } from 'react';
import { Icon } from '../../../../Icons';
import { RideRequest } from '../../../../../types';

interface Props {
  ride: RideRequest;
  onAllPresent: () => void;
}

export const CrewConfirmation: React.FC<Props> = ({ ride, onAllPresent }) => {
  const [helpersOnSite, setHelpersOnSite] = useState(false);
  const [equipmentReady, setEquipmentReady] = useState(false);
  const helpersCount = ride.errandDetails?.helpersCount || 0;

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <header className="shrink-0 flex items-center bg-white p-4 border-b border-slate-200">
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Helper Team Check</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {/* Section Title: Assigned Crew */}
        <div className="pb-6">
            <h2 className="text-slate-900 text-xl font-extrabold leading-tight tracking-tight">Assigned Crew</h2>
            <p className="text-slate-500 text-xs mt-1">Verify your team is present on site</p>
        </div>

        {/* Crew List Container */}
        <div className="space-y-3">
            {/* Lead Mover (Always present in simulation) */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <div className="bg-slate-200 rounded-full h-12 w-12 flex items-center justify-center border-2 border-brand-orange/20">
                        <Icon name="person" className="text-slate-400" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex flex-col flex-1 justify-center">
                    <p className="text-slate-900 text-sm font-bold leading-normal">Lead Mover (You)</p>
                    <p className="text-brand-orange text-[10px] font-semibold uppercase tracking-wider">Primary Driver</p>
                </div>
            </div>

            {/* Helpers based on count */}
            {Array.from({ length: helpersCount }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative">
                        <div className="bg-slate-200 rounded-full h-12 w-12 flex items-center justify-center border-2 border-brand-orange/20">
                            <Icon name="person" className="text-slate-400" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col flex-1 justify-center">
                        <p className="text-slate-900 text-sm font-bold leading-normal">Helper #{i + 1}</p>
                        <p className="text-brand-orange/70 text-[10px] font-semibold uppercase tracking-wider">On-Site Support</p>
                    </div>
                </div>
            ))}

            {helpersCount === 0 && (
                <div className="p-4 bg-slate-100 rounded-xl text-center">
                    <p className="text-xs text-slate-500">No additional helpers assigned to this job.</p>
                </div>
            )}
        </div>

        {/* Section Title: Checklist */}
        <div className="pb-3 pt-8">
            <h2 className="text-slate-900 text-xl font-extrabold leading-tight tracking-tight">Arrival Checklist</h2>
            <p className="text-slate-500 text-xs mt-1">Complete these steps before starting</p>
        </div>

        {/* Checklist items */}
        <div className="space-y-3">
            <label className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer group">
                <div className="flex-1">
                    <p className="text-slate-900 text-sm font-bold">Helpers on-site</p>
                    <p className="text-slate-500 text-[10px]">Verify all helpers are physically present</p>
                </div>
                <input 
                    type="checkbox" 
                    checked={helpersOnSite || helpersCount === 0} 
                    onChange={(e) => setHelpersOnSite(e.target.checked)}
                    disabled={helpersCount === 0}
                    className="h-6 w-6 rounded border-slate-300 text-brand-orange focus:ring-brand-orange" 
                />
            </label>

            <label className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer group">
                <div className="flex-1">
                    <p className="text-slate-900 text-sm font-bold">Equipment Ready</p>
                    <p className="text-slate-500 text-[10px]">Straps, blankets, and dollies inspected</p>
                </div>
                <input 
                    type="checkbox" 
                    checked={equipmentReady}
                    onChange={(e) => setEquipmentReady(e.target.checked)}
                    className="h-6 w-6 rounded border-slate-300 text-brand-orange focus:ring-brand-orange" 
                />
            </label>
        </div>
      </main>

      {/* Footer Action */}
      <footer className="shrink-0 p-4 pb-8 bg-white border-t border-slate-200">
        <button 
          onClick={onAllPresent}
          disabled={(!helpersOnSite && helpersCount > 0) || !equipmentReady}
          className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${((!helpersOnSite && helpersCount > 0) || !equipmentReady) ? 'bg-slate-200 text-slate-400' : 'bg-brand-orange text-white shadow-brand-orange/20'}`}
        >
          <Icon name="play_arrow" />
          START LOADING
        </button>
        <p className="text-center text-slate-400 text-[10px] mt-3 uppercase tracking-widest font-semibold">Job ID: #{ride.id.slice(-4)}</p>
      </footer>
    </div>
  );
};
