import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onConfirm: () => void;
}

export const PackagePickupVerification: React.FC<Props> = ({ onConfirm }) => {
  return (
    <div className="relative flex h-[100dvh] max-w-md mx-auto flex-col bg-slate-50 overflow-hidden font-sans animate-slide-up">
        {/* Header */}
        <div className="flex items-center bg-white p-4 border-b border-brand-purple/10 justify-between">
            <button className="text-brand-purple flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-brand-purple/10 transition-colors">
                <Icon name="arrow_back" />
            </button>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Verify Pickup</h2>
        </div>

        {/* Camera Viewport Area */}
        <div className="flex-1 relative overflow-hidden bg-black">
            <div className="w-full h-full relative bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0waKnPQ48NMv2N67Z4_ZJtPzfGwEXONKpBx02I1RESWd_Yiecho7M4nD-K20b8Ye2D_qq1XHYMHxMyxidpuSedetJIYLzcykTBzidX7j6Fkx49vZGM5-VlvBXvTQskuzHdCaVND6pwUrFuEkKOuX5e52GPbIChg7TkG72Uvr5ycLbQW6rHjQ3siFEHLPw9Rq6DGjNqi4RABY8Ukqy5_7PNKSu26OyiZknrNbdC1JPWT5pDKhxDhhtZx9aMqXcKsNDMUhrM4_6gGX7')" }}>
                {/* Viewfinder Brackets */}
                <div className="absolute inset-12 border-2 border-white/40 rounded-xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-purple rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-brand-purple rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-brand-purple rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-purple rounded-br-lg"></div>
                </div>

                {/* Overlay Camera Controls */}
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-8 px-4">
                    <button className="flex shrink-0 items-center justify-center rounded-full size-12 bg-white/20 backdrop-blur-md text-white border border-white/30">
                        <Icon name="image" />
                    </button>
                    <button className="flex shrink-0 items-center justify-center rounded-full size-20 bg-white/30 backdrop-blur-lg border-4 border-white p-1">
                        <div className="size-full bg-white rounded-full"></div>
                    </button>
                    <button className="flex shrink-0 items-center justify-center rounded-full size-12 bg-white/20 backdrop-blur-md text-white border border-white/30">
                        <Icon name="flash_on" />
                    </button>
                </div>

                {/* Location Tag */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Icon name="location_on" className="text-sm" />
                    <span>Sandton, Gauteng</span>
                </div>
            </div>
        </div>

        {/* Package Details Bottom Sheet */}
        <div className="bg-white rounded-t-3xl shadow-2xl p-6 -mt-6 z-10">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
            <h3 className="text-slate-900 text-xl font-bold leading-tight mb-4">Package Pickup Details</h3>
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-slate-600 text-sm font-semibold uppercase tracking-wider">Reference / Order Number</label>
                    <div className="relative">
                        <input 
                            className="w-full rounded-xl border-slate-200 bg-slate-50 p-4 pr-12 text-slate-900 focus:border-brand-purple focus:ring-brand-purple outline-none" 
                            placeholder="e.g. ZA-7742-JHB" 
                            type="text" 
                            defaultValue="RSA-998234-X"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-purple">
                            <Icon name="qr_code_scanner" />
                        </div>
                    </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl flex items-start gap-3">
                    <Icon name="info" className="text-brand-purple" />
                    <p className="text-sm text-slate-700">
                        Please ensure the package is clearly visible in the photo for successful verification.
                    </p>
                </div>
                <button 
                    onClick={onConfirm}
                    className="w-full bg-brand-purple hover:bg-brand-purple/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-purple/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Icon name="check_circle" />
                    Confirm Pickup
                </button>
            </div>
        </div>
    </div>
  );
};
