import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onVerify: () => void;
}

export const HandoverScanPinEntry: React.FC<Props> = ({ onVerify }) => {
  return (
    <div className="bg-slate-50 font-sans text-slate-900 min-h-[100dvh] flex flex-col animate-slide-up">
        {/* Header */}
        <header className="p-4 flex items-center gap-4 bg-white border-b border-slate-100">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Icon name="arrow_back" />
            </button>
            <div>
                <h1 className="font-bold text-lg leading-tight">Confirm Handover</h1>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Order #RSA-88291</p>
            </div>
            <button className="ml-auto w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <Icon name="help_outline" />
            </button>
        </header>

        {/* Scanner Viewport Area */}
        <main className="flex-1 relative overflow-hidden bg-slate-900">
            {/* Mock Camera Feed */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCCpqFrV3WWz1Rc-fc7C5UprwABY3Mc478-xu3XPBzVNYT52aYUfiWkU0wzjGegBecI2UGsFRUaGV9KkZiGhwGR4rLX1YFPWXSbU50t-Y1sA1J2xOAj6tNQC6dKUaSrn_vFuTjnktGNKmX3g7kdag9DJQ999rEpH_0u0mo6nTGcIb3hTKHtlPkxY5zgnxJCtPzbZDk7lf-tk386C5lID2lPg4ENLlrOerhHtcdWivqzkEo4KB6F26_88I5KjZIGK_xzH86IWo6PbpKK')" }}></div>
            </div>

            {/* Scanner Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                {/* Scanning Frame */}
                <div className="relative w-72 h-72">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-brand-orange rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-brand-orange rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-brand-orange rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-brand-orange rounded-br-xl"></div>
                    
                    {/* Scanning Line Animation Simulation */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-orange/50 shadow-[0_0_15px_rgba(236,91,19,0.8)]"></div>
                    
                    {/* Mock QR Code in Viewport */}
                    <div className="absolute inset-8 border border-white/20 rounded-lg flex items-center justify-center">
                        <Icon name="qr_code_2" className="text-white/40 text-6xl" />
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-12 text-center px-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white mb-4">
                        <Icon name="info" className="text-sm text-brand-orange" />
                        <span className="text-sm font-medium">Scan Recipient QR or Enter PIN</span>
                    </div>
                    <p className="text-white/80 text-sm max-w-xs">Position the recipient's personal QR code within the frame to automatically verify the delivery.</p>
                </div>
            </div>

            {/* Camera Controls */}
            <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center gap-8">
                <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    <Icon name="flashlight_on" />
                </button>
                <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    <Icon name="zoom_in" />
                </button>
            </div>
        </main>

        {/* Bottom Actions Section */}
        <section className="bg-white p-6 rounded-t-xl shadow-2xl -mt-4 relative z-30">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200">
                        <img alt="Customer Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjavLKZIA2588rSnJztatdlW_ngFfgzlH4Tfk-n_-7zCiRljdzbLzX3mxezAEf_-eznFC9vNUFxXdDMnNrzO-jbeMdrRbKHu8Vk5JUWIdNDEuFhXW7fVYT_P_3x0xLYOijBPXJ7mvrnuZKEVzrwVG3H0BHX85SK1KYQUEJm21WaWQ14Dn9M7MkWB1NFt-Uqln2jq6uCqrk74mhZXeUZeRqK4tAlem6gVaOkNUL1pmkSWWnyyY9Jul0MVGsM5biQO0VA0LMQktuaqTr"/>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Marcus Thompson</h3>
                        <p className="text-xs text-slate-500">Recipient • Apartment 4B</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                        <Icon name="call" className="text-lg" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                        <Icon name="chat_bubble" className="text-lg" />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-3">
                    <button 
                        onClick={onVerify}
                        className="flex-1 bg-brand-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/30 flex items-center justify-center gap-2"
                    >
                        <Icon name="pin" />
                        Enter PIN Manually
                    </button>
                </div>
                <button className="w-full text-slate-500 font-medium py-2 text-sm">
                    Recipient can't find QR code?
                </button>
            </div>
            
            {/* Drag handle */}
            <div className="flex justify-center mt-4">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
            </div>
        </section>
    </div>
  );
};
