import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onEmergency: () => void;
    onComplete: () => void;
}

export const ActiveCompanionTracking: React.FC<Props> = ({ onEmergency, onComplete }) => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden max-w-md mx-auto border-x border-slate-200 font-sans animate-slide-up">
        {/* Header / Status Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-teal/20 p-2 rounded-lg">
                        <Icon name="navigation" className="text-brand-teal" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">On Trip • Companion Ride</p>
                        <h2 className="text-sm font-bold leading-tight text-slate-900">42 Sandton Drive</h2>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-brand-teal">12 mins</p>
                    <p className="text-[10px] text-slate-500 italic">4.2 km</p>
                </div>
            </div>
        </div>

        {/* Main Map Area */}
        <div className="relative flex-1 bg-slate-200">
            {/* Simulated Map Image */}
            <div className="absolute inset-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAF_6j1J1u5QmuWwWEGe_NZNs9h5frZHtOy7ZTDEUC6vL14hMJ9iSvSU1Vo4XORMFhHhGXHvoYuYSslAiqnkfzJ4NzP_tsFqy_z5Bv6te52EUeOwLbGmb8IMVXF0D9RK3SdxJ0HfScFMhYtPljgmzQdPhMn_dKPUM0hfl_-Z4Sc0ALDQIHviTRVf1YHr28mE-Kpc7p9UTMA0hcv2SSerkofC9QCR1H1WxOfEkq-iVKKtg2COqkiLGYk7VPSs6L6v47j-g5giLjPYVFP')" }}></div>
            
            {/* Map Overlay UI */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/90 via-transparent to-slate-50/90 pointer-events-none opacity-20"></div>

            {/* Route Elements (Simulated) */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                    {/* Start Point */}
                    <div className="absolute top-[60%] left-[30%] w-4 h-4 bg-slate-900 rounded-full border-2 border-white shadow-md"></div>
                    {/* Teal Route Line (Simulated via div) */}
                    <div className="absolute top-[40%] left-[30%] w-1 h-[20%] bg-brand-teal shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                    <div className="absolute top-[40%] left-[30%] w-[40%] h-1 bg-brand-teal shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                    {/* Destination Pin */}
                    <div className="absolute top-[35%] left-[70%]">
                        <Icon name="location_on" className="text-brand-teal text-4xl drop-shadow-md" />
                    </div>
                </div>
            </div>

            {/* Floating Map Controls */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-2">
                <button className="flex size-12 items-center justify-center rounded-xl bg-white shadow-lg text-slate-700">
                    <Icon name="add" />
                </button>
                <button className="flex size-12 items-center justify-center rounded-xl bg-white shadow-lg text-slate-700">
                    <Icon name="remove" />
                </button>
                <button className="mt-2 flex size-12 items-center justify-center rounded-xl bg-brand-teal shadow-lg text-white">
                    <Icon name="near_me" />
                </button>
            </div>
        </div>

        {/* Bottom Sheet Info */}
        <div className="relative z-10 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] border-t border-slate-100 px-6 pt-2 pb-6">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6"></div>
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img className="size-14 rounded-full object-cover border-2 border-brand-teal/20" alt="Companion" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDa0CaMO5rR9tXve5mDBDeuKjCVHmrkp9MnrTjQfi1SbDhvpNLN6yIutPRmGNJ1nZIzBIlJupgoi0Ki3r8uPzh8q5fUrQnrwOZ1eRj8G6EI6k1_tanIzImNmm25R4X8_iLmfb-F9wM9KLeWDjM8wVwr_twVTlFopHYgq68pj3oRznMqkxU1s9byOxLf9uVEM47pxsYRTlJvt9kB8SeVDVbqwsugKhkpYKrUESuJrRog9m1XADJm-9m6LJC35J4e-zFF2cTxfhJ2SXK7"/>
                        <div className="absolute -bottom-1 -right-1 bg-brand-teal text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase">Pro</div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Sarah Jenkins</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Icon name="star" className="text-xs text-amber-500" /> 4.9 Companion
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <Icon name="chat_bubble" />
                    </button>
                    <button className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <Icon name="call" />
                    </button>
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={onComplete}
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl bg-brand-teal text-white font-bold text-sm shadow-lg shadow-brand-teal/20 active:scale-95 transition-all"
                >
                    <Icon name="check_circle" className="text-sm" />
                    Arrived at Drop-off
                </button>
                <button 
                    onClick={onEmergency}
                    className="flex items-center justify-center px-4 h-12 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm gap-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <Icon name="shield" className="text-inherit" />
                    <span className="hidden sm:inline">Safety</span>
                </button>
            </div>
        </div>
    </div>
  );
};
