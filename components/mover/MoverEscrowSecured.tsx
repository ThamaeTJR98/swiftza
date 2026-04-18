import React from 'react';
import { Icon } from '../Icons';

export const MoverEscrowSecured: React.FC = () => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background-light text-slate-900 antialiased font-display">
      <div className="absolute inset-0 z-0 bg-slate-800 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full opacity-60 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAfGkISjbSVznbWbQPnjbne9ZFagCg76Hkb3dSAC9i0WY_lEtEDcuO1hvExXWfwB--w4oKsOK470pKzlJtM7aDIOcR8_gRe3tza28vHsk_VmX-bCH9vZf9ThsMEHEWlStZQRRm-MGYxSda9RUofwBtBFky9SCZ_o-ltJdYrmfR-ArTW1acoFwE_a5AMM-0LnYf-aQCM2VmSR-HwybhScN0fhN0ZcmdN0Kvo82-Lc_TIDnr3rS0ZITA5JfRELASJjfXL8qUWOzRs2i7k')" }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center p-4 justify-between bg-gradient-to-b from-black/60 to-transparent">
          <button className="text-white flex size-10 shrink-0 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm">
            <Icon name="close" />
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Handover Scan</h2>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-start pt-12 px-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center max-w-sm">
            <h3 className="text-white tracking-tight text-xl font-bold leading-tight mb-2">Scan Client QR Code</h3>
            <p className="text-slate-200 text-sm leading-relaxed">Position the customer's QR code within the frame to release the Escrow payment.</p>
          </div>
        </div>
        
        <div className="p-4 space-y-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-safe-action">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-white/10 backdrop-blur-lg border border-white/20 p-4 shadow-2xl">
            <div className="flex flex-col gap-1">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Job Total Payout</p>
              <p className="text-white text-3xl font-bold leading-none">R1,155</p>
            </div>
            <div className="flex items-center gap-2 bg-primary px-3 py-2 rounded-lg">
              <Icon name="shield" className="text-white text-sm" />
              <span className="text-white text-xs font-bold uppercase">Escrow Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
