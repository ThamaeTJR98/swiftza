import React from 'react';
import { Icon } from '../../../../Icons';
import { RideStop } from '../../../../../types';

interface Props {
    currentStop: RideStop;
    onStartQueue: () => void;
}

export const RunnerStartQueue: React.FC<Props> = ({ currentStop, onStartQueue }) => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-x-hidden bg-[#f8f6f6] text-slate-900 font-sans animate-slide-up">
        {/* Header */}
        <div className="flex items-center bg-white p-4 pb-4 justify-between border-b border-slate-200 sticky top-0 z-10">
            <div className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                <Icon name="arrow_back" />
            </div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Queue Session</h2>
        </div>

        <main className="flex-1 pb-24 overflow-y-auto">
            {/* Status Badge */}
            <div className="px-4 pt-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 text-sm font-semibold mb-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Arrived at Location
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Current Assignment</h1>
            </div>

            {/* Task Detail Card */}
            <div className="p-4">
                <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm border border-slate-200">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-1 flex-1">
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Location</p>
                            <p className="text-slate-900 text-lg font-bold leading-tight">{currentStop.address.split(',')[0]}</p>
                            <p className="text-slate-500 text-sm">{currentStop.address}</p>
                        </div>
                        <div className="size-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                            <Icon name="location_on" className="text-3xl" />
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="w-full bg-slate-200 aspect-video bg-center bg-no-repeat bg-cover rounded-xl overflow-hidden relative" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCAaJU-qVuzp_4GmnRA7V72gZh7wHwD4Fe8-JEoJP0h7R0npSMdq0ni0lk_MtX_zTxMaEVoTxGK5BHvDR3N-6-179dX3kZdPzKD_HXo0tT79PIKG8ny97XN8Cn6Tqgu1Bt5AZj7WCPjCk66LHkb_HkCJm9TsnSvAYstfolL9cr4VpGfSRcuvn_KuSpvYUjd3V1yjXyRKW2sLLZIkdrwNLDPFaLGZBFYJHyLPY59PND2A80fWuUSGfq4Y76WU1jD0-QwXEg8DHgrOJIx")' }}>
                        <div className="absolute inset-0 bg-orange-500/10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white p-2 rounded-full shadow-lg border-2 border-orange-500">
                                <Icon name="person_pin_circle" className="text-orange-500" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                        <div className="flex flex-col">
                            <p className="text-slate-500 text-xs">Estimated Earnings</p>
                            <p className="text-slate-900 font-bold">R 150.00 / hour</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-slate-500 text-xs">Queue Time (Est.)</p>
                            <p className="text-slate-900 font-bold">2.5 hrs</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Geofencing Alert */}
            <div className="px-4">
                <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-orange-500/20 bg-orange-500/5 p-5 sm:flex-row sm:items-center">
                    <div className="flex gap-4">
                        <div className="text-orange-600 flex shrink-0 items-center">
                            <Icon name="gpp_good" className="text-3xl" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-slate-900 text-base font-bold leading-tight">GPS Geofencing Active</p>
                            <p className="text-slate-600 text-sm leading-normal">You are within the 50m radius. Stay here to maintain session validity and receive payments.</p>
                        </div>
                    </div>
                    <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-300 p-0.5 has-[:checked]:justify-end has-[:checked]:bg-orange-500">
                        <div className="h-full w-[27px] rounded-full bg-white shadow-md"></div>
                        <input defaultChecked className="invisible absolute" type="checkbox" />
                    </label>
                </div>
            </div>

            {/* Primary Action */}
            <div className="p-4 mt-4">
                <button 
                    onClick={onStartQueue}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-orange-500/20 flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
                >
                    <span className="text-xl tracking-wide">START QUEUE TIMER</span>
                    <span className="text-xs font-normal opacity-90 uppercase tracking-[0.1em]">Tap when you are in line</span>
                </button>
                <p className="text-center text-slate-400 text-xs mt-4 italic">
                    By starting, you agree to the automated time-tracking policy.
                </p>
            </div>
        </main>
    </div>
  );
};

