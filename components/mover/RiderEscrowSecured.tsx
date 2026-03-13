import React from 'react';
import { Icon } from '../Icons';

export const RiderEscrowSecured: React.FC = () => {
  return (
    <div className="font-display bg-background-light text-slate-900 min-h-[100dvh] flex items-center justify-center p-4">
      {/* Mobile Screen Container */}
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 relative flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between">
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100">
            <Icon name="arrow_back" />
          </button>
          <h1 className="text-lg font-bold tracking-tight">Payment in Escrow</h1>
          <div className="w-10"></div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 px-6 overflow-y-auto pb-8">
          {/* Hero Badge Section */}
          <div className="mt-4 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name="verified_user" className="text-primary text-5xl" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg">
                Funds Secured
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">R1,155.00</h2>
            <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed">
              Successfully held in SwiftZA Safe-Box for your upcoming move.
            </p>
          </div>
          
          {/* Financial Breakdown */}
          <div className="mt-8 bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Transaction Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Icon name="local_shipping" className="text-primary text-sm" />
                  </div>
                  <span className="text-sm font-medium">Move Base Fee</span>
                </div>
                <span className="font-semibold text-sm">R850.00</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Icon name="groups" className="text-primary text-sm" />
                  </div>
                  <span className="text-sm font-medium">Helper Package</span>
                </div>
                <span className="font-semibold text-sm">R200.00</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                    <Icon name="info" className="text-primary text-sm" />
                  </div>
                  <span className="text-sm font-medium">Dispute Buffer (10%)</span>
                </div>
                <span className="font-semibold text-sm">R105.00</span>
              </div>
              <div className="pt-4 border-t border-dashed border-slate-200 flex justify-between items-center">
                <span className="text-base font-bold">Total Secured</span>
                <span className="text-base font-extrabold text-primary">R1,155.00</span>
              </div>
            </div>
          </div>
          
          {/* Security Assurance Card */}
          <div className="mt-6 bg-slate-900 p-5 rounded-2xl relative overflow-hidden">
            <div className="relative z-10 flex gap-4">
              <div className="shrink-0">
                <Icon name="lock" className="text-primary" />
              </div>
              <p className="text-[13px] leading-relaxed text-slate-100">
                Your payment is safely held by <span className="font-bold text-primary">SwiftZA</span> and will only be released once the move is confirmed as <span className="font-bold">completed</span>.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Icon name="security" className="text-8xl" />
            </div>
          </div>
        </main>
        
        {/* Fixed Footer Actions */}
        <footer className="p-6 pb-safe-action bg-white border-t border-slate-100">
          <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all">
            <span>View Move Progress</span>
            <Icon name="trending_flat" className="text-sm" />
          </button>
        </footer>
      </div>
    </div>
  );
};
