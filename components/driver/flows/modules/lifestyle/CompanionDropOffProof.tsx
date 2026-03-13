import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onConfirm: () => void;
}

export const CompanionDropOffProof: React.FC<Props> = ({ onConfirm }) => {
  return (
    <div className="relative flex h-auto min-h-[100dvh] w-full max-w-md mx-auto flex-col bg-slate-50 overflow-x-hidden shadow-2xl font-sans animate-slide-up">
        {/* TopAppBar */}
        <div className="flex items-center bg-white p-4 pb-2 justify-between border-b border-slate-200">
            <div className="text-slate-900 flex size-12 shrink-0 items-center cursor-pointer">
                <Icon name="arrow_back" className="text-2xl" />
            </div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Drop-off Verification</h2>
            <div className="size-12 flex items-center justify-end">
                <Icon name="help" className="text-2xl text-slate-400" />
            </div>
        </div>

        {/* Instructions Header */}
        <div className="px-4 pt-6 pb-2">
            <div className="inline-flex items-center px-2 py-1 rounded-md bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider mb-2">
                Companion Ride
            </div>
            <h3 className="text-slate-900 text-2xl font-bold leading-tight tracking-tight">Gate Entry Protocol</h3>
            <p className="text-slate-600 text-base font-normal leading-relaxed pt-2">
                Please capture a clear photo of the passenger safely entering the residential gate in Sandton.
            </p>
        </div>

        {/* Camera Viewfinder Area */}
        <div className="p-4 flex-1 flex flex-col">
            <div className="relative flex flex-1 items-center justify-center bg-slate-200 rounded-xl overflow-hidden border-2 border-brand-teal/20 shadow-inner group">
                {/* Mock Camera Feed Image */}
                <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvIpk-GQcRiQmHWhxaFcHyrC9diMHtN65TlDl6ARodDyn8ug6Gk0bqQi0F0pAYWjMGCSwfMQrr97_H2M73N5X3xDo6amGx_yMR-0i5yzrOevXUx23Zth_lRBH07HBx-PNUeJiVW9zQmilh3jL-uV_Q4Q4ODXcMmqa1NSqKA1AVU3qcwnQhMbzH2Mukq-tHHdFrjMMtu08luUXktqh66wlHlwYZiWZ_1dq-XlLHgH2jpsy6NkyYz21TXnkNCZvzvHSYq7U7UBMWZkdV')" }}></div>
                
                {/* Camera Overlay Elements */}
                <div className="absolute inset-0 border-[24px] border-black/10 pointer-events-none"></div>
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs backdrop-blur-md">
                    <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
                    LIVE VIEW
                </div>

                {/* Focus Brackets */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-white/50 rounded-lg flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                </div>

                {/* Capture Button Visual */}
                <div className="absolute bottom-6 flex w-full justify-center px-4">
                    <div className="flex items-center justify-between w-full max-w-[240px] bg-black/30 backdrop-blur-lg p-3 rounded-full border border-white/20">
                        <button className="flex shrink-0 items-center justify-center rounded-full size-10 bg-white/10 text-white hover:bg-white/20 transition-colors">
                            <Icon name="collections" />
                        </button>
                        <button className="flex shrink-0 items-center justify-center rounded-full size-16 bg-white border-4 border-brand-teal shadow-xl active:scale-95 transition-transform">
                            <Icon name="photo_camera" className="text-brand-teal text-3xl font-bold" />
                        </button>
                        <button className="flex shrink-0 items-center justify-center rounded-full size-10 bg-white/10 text-white hover:bg-white/20 transition-colors">
                            <Icon name="flash_on" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Passenger Details Mini-Card */}
        <div className="px-4 py-2">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                <div className="size-12 rounded-full overflow-hidden bg-slate-100">
                    <img alt="Passenger Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_g5-O8WwyQvG6FsdfJwxnBtgtZ5h7M8HtS553ih1qgg_VYQUCURq3FEYxbLnYEs1qIaYAWILAJtoRreeBXEnLAfuFDniqJlVTtuBWAqw1rf-pa9I6QrvVjAvZ6PzH4skoWMCVNDk_SIyKMpaVW4epzJ5AKbDgVumT1bAfyPcj2pf6UwAW0FIcJPrzSCjqFb8hlanCYjGHIRTtgd3CcDxvHf49WmYAHe7o9hK6-yYShfszoPxdpWfQCOUFjYmcU5o9jEaozLXenBmL"/>
                </div>
                <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium">PASSENGER</p>
                    <p className="text-base font-bold text-slate-900">Thandiwe K.</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">DROP-OFF</p>
                    <p className="text-base font-bold text-brand-teal">Sandton CBD</p>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200">
            <button 
                onClick={onConfirm}
                className="w-full bg-brand-teal hover:bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-teal/20 flex items-center justify-center gap-2 transition-colors"
            >
                <Icon name="verified_user" />
                Confirm Safe Entry
            </button>
            <button className="w-full mt-3 bg-transparent text-slate-500 font-medium py-2 rounded-xl text-sm hover:text-slate-700 transition-colors">
                Issue with Gate Access?
            </button>
        </div>

        {/* Bottom Safe Area Spacer */}
        <div className="h-6 bg-white"></div>
    </div>
  );
};
