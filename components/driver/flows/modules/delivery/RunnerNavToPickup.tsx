import React from 'react';
import { Icon } from '../../../../Icons';
import { RideStop } from '../../../../../types';
import { GoogleMapComponent } from '../../../../shared/GoogleMapComponent';

interface Props {
    currentStop: RideStop;
    onArrive: () => void;
    onCancel: () => void;
    title?: string;
}

export const RunnerNavToPickup: React.FC<Props> = ({ currentStop, onArrive, onCancel, title = "En route to pickup" }) => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans animate-slide-up">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-4">
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-purple/20 p-2 rounded-lg text-brand-purple">
                        <Icon name="navigation" />
                    </div>
                    <div>
                        <h2 className="text-slate-900 text-sm font-bold leading-tight">{title}</h2>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Heading to: {currentStop.address}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <Icon name="battery_charging_full" />
                    </button>
                    <button onClick={onCancel} className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <Icon name="more_vert" />
                    </button>
                </div>
            </div>
        </header>

        {/* Main Map Area */}
        <main className="relative flex-1 overflow-y-auto">
            <div className="h-full w-full bg-slate-200 relative overflow-hidden">
                <GoogleMapComponent lat={currentStop.lat} lng={currentStop.lng} />
                
                {/* Floating Map Controls */}
                <div className="absolute right-4 bottom-32 flex flex-col gap-3">
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xl border border-slate-200 text-slate-700">
                        <Icon name="add" />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xl border border-slate-200 text-slate-700">
                        <Icon name="remove" />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-purple text-white shadow-xl">
                        <Icon name="my_location" />
                    </button>
                </div>
            </div>

            {/* Ride Details Drawer (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe-action">
                <div className="bg-white p-5 rounded-2xl shadow-2xl border border-slate-100">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="bg-brand-purple/10 text-brand-purple text-[10px] font-bold px-2 py-0.5 rounded-full w-fit uppercase">Current Trip</span>
                            <h3 className="text-slate-900 text-lg font-bold">2.4 miles • 8 mins</h3>
                            <p className="text-slate-500 text-sm">Pick up at {currentStop.address}</p>
                        </div>
                        <button 
                            onClick={onArrive}
                            className="flex items-center gap-2 bg-brand-purple hover:bg-brand-purple/90 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
                        >
                            <Icon name="near_me" className="text-sm" />
                            <span>Arrived</span>
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <p className="text-slate-700 text-sm font-semibold">Distance to Pickup</p>
                            <p className="text-brand-purple text-sm font-bold">65%</p>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-purple rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-3 rounded-xl border border-slate-200 font-semibold">
                            <Icon name="chat" className="text-[20px]" />
                            <span>Message</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-3 rounded-xl border border-slate-200 font-semibold">
                            <Icon name="call" className="text-[20px]" />
                            <span>Call</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
};
