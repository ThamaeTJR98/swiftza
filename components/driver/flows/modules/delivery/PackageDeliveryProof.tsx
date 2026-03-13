import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onConfirm: () => void;
}

export const PackageDeliveryProof: React.FC<Props> = ({ onConfirm }) => {
  return (
    <div className="relative flex h-auto min-h-[100dvh] w-full max-w-md mx-auto flex-col bg-slate-50 overflow-x-hidden shadow-2xl font-sans animate-slide-up">
        {/* Top App Bar */}
        <div className="flex items-center bg-slate-50 p-4 pb-2 justify-between">
            <div className="text-slate-900 flex size-10 shrink-0 items-center justify-center cursor-pointer">
                <Icon name="arrow_back" className="text-2xl" />
            </div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Delivery Proof</h2>
        </div>

        {/* Header Content */}
        <div className="px-4 pt-6 pb-2">
            <div className="flex items-center gap-2 mb-1">
                <Icon name="check_circle" className="text-brand-purple text-xl" />
                <p className="text-brand-purple text-sm font-bold uppercase tracking-wider">Delivered</p>
            </div>
            <h2 className="text-slate-900 text-2xl font-bold leading-tight tracking-tight">Package Delivered Safely</h2>
            <p className="text-slate-500 text-sm font-normal mt-1">Today at 2:45 PM • Runner: Marcus J.</p>
        </div>

        {/* Main Delivery Photo */}
        <div className="flex w-full grow bg-slate-50 py-4 px-4">
            <div className="w-full overflow-hidden rounded-xl aspect-[4/5] relative shadow-lg ring-1 ring-slate-200">
                <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_LKfzHa_GhKhYszdfzWTmtBfksGsy2S4yiiBjUmTxN1rqLhEuaasqKV5SJQ8YTyqCPK5olfQUi6LFq2H3sx5BZxyhbakd7OyaZiIEaryZZDD4_XR3PgizX7jigpIq03oThfY0WNydQLyBWbww6hPFKTOgNq8G9CY_7xPIVEY9n0gv7E9TYPKpSCKrKU2lehiaLF6uzUjbvWljRr6JA-0oR_7XL9smY8ugH7JjzPtoSPXMd6f1HzUoUUxHUIfgysMjxC33KyLDuzSG')" }}></div>
                {/* Photo Overlay Tag */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                    <Icon name="location_on" className="text-white text-xs" />
                    <span className="text-white text-[10px] font-medium tracking-wide">CONFIRMED AT PORCH</span>
                </div>
            </div>
        </div>

        {/* Info Sections */}
        <div className="px-4 space-y-4 pb-8">
            {/* Location Details */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <div className="text-brand-purple flex items-center justify-center rounded-lg bg-brand-purple/10 shrink-0 size-12">
                    <Icon name="home_pin" />
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-slate-900 text-sm font-bold leading-normal">Delivery Location</p>
                    <p className="text-slate-500 text-xs font-normal leading-normal">4521 Oakwood Avenue, Unit 4B</p>
                </div>
            </div>

            {/* Runner Message */}
            <div className="flex flex-col gap-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-slate-900 text-sm font-bold">Runner's Note</p>
                <p className="text-slate-600 text-sm italic">"Left your package behind the white pillar to keep it out of sight from the street. Have a great day!"</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button 
                    onClick={onConfirm}
                    className="flex-1 bg-brand-purple text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                    <Icon name="thumb_up" className="text-lg" />
                    Confirm & Rate
                </button>
                <button className="flex-1 bg-slate-200 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                    <Icon name="help" className="text-lg" />
                    Support
                </button>
            </div>
        </div>

        {/* Map Mini-View (Contextual) */}
        <div className="px-4 pb-10">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-1">Drop-off Confirmation</p>
            <div className="w-full h-32 rounded-xl overflow-hidden shadow-inner grayscale contrast-75 opacity-80 border border-slate-200">
                <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGJMzxYa6ngX0Jxg2ipuW5SYbAjXYt8LuXCSV5e67WS4SIyCgYZ_mhZ7mFEqFCryiiSDYG_WmB-5oxWREdChrLQ414z-aCPaGiAbNyo9lsQtFjZlfTwiffOC4wIp5He4eTWclVOS0by7zR6IwXEN-m3kOwlGamPohIxIKiFpcONFTmZEcZ2mxjWFJUmOOn6eEnxncw7RjD18h_UqNMHqbkJq0f3RBcI5BUcBZ3xfbXlssKMZgc1Sx2MjMbzUrN8KvkpJwZpLO-lGsD')" }}></div>
            </div>
        </div>
    </div>
  );
};
