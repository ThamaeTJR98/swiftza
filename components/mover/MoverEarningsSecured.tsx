import React from 'react';
import { Icon } from '../Icons';

export const MoverEarningsSecured: React.FC = () => {
  return (
    <div className="relative mx-auto flex min-h-[100dvh] max-w-md flex-col overflow-x-hidden border-x border-slate-200 shadow-xl bg-background-light font-display">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-slate-200 sticky top-0 bg-background-light/80 backdrop-blur-md z-10">
        <button className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 transition-colors">
          <Icon name="arrow_back" className="text-slate-700" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Earnings Secured</h2>
      </div>
      
      {/* Hero Content */}
      <div className="flex flex-col px-6 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Status Illustration */}
          <div className="w-full aspect-video rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border border-primary/20">
            <div className="bg-white p-6 rounded-full shadow-lg">
              <Icon name="lock" className="text-primary text-6xl" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-xl font-bold leading-tight text-center">Payment Locked in Escrow</h3>
            <p className="text-slate-600 text-sm font-normal leading-relaxed text-center">
              Your payment for this move is securely held in escrow. Funds will be released to your wallet immediately after the client scans your handover QR code.
            </p>
          </div>
          <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-teal-700 active:scale-[0.98] transition-all">
            <Icon name="qr_code_2" className="text-xl" />
            <span className="truncate">View Handover QR Code</span>
          </button>
        </div>
      </div>
      
      {/* Financial Summary Card */}
      <div className="px-4 pb-4">
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-primary/10 border border-primary/20">
          <p className="text-slate-700 text-sm font-medium">Expected Net Payout</p>
          <div className="flex items-baseline gap-2">
            <p className="text-primary text-3xl font-extrabold tracking-tight">R 1,200.00</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Icon name="info" className="text-teal-600 text-sm" />
            <p className="text-teal-700 text-xs font-semibold uppercase tracking-wider">-20% platform fee applied</p>
          </div>
        </div>
      </div>
      
      {/* Detailed Breakdown */}
      <div className="px-6 py-4 flex flex-col gap-1">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Payout Details</h4>
        <div className="flex justify-between items-center py-3 border-b border-slate-100">
          <p className="text-slate-600 text-sm">Gross Amount</p>
          <p className="font-semibold text-sm">R 1,500.00</p>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-slate-100">
          <p className="text-slate-600 text-sm">Platform Commission (20%)</p>
          <p className="font-semibold text-sm text-red-500">-R 300.00</p>
        </div>
        <div className="flex justify-between items-center py-3">
          <p className="text-slate-900 text-sm font-bold">Net Amount</p>
          <p className="font-bold text-sm text-primary">R 1,200.00</p>
        </div>
      </div>
      
      {/* Help Section */}
      <div className="mt-auto px-6 py-8">
        <div className="rounded-lg bg-slate-100 p-4 flex gap-3 items-start">
          <Icon name="help_outline" className="text-slate-500" />
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold">Need help?</p>
            <p className="text-xs text-slate-500 leading-relaxed">If the client is unable to scan the code, please contact SwiftZA support immediately.</p>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation Bar */}
      <div className="flex border-t border-slate-200 bg-white px-4 pb-safe-action pt-3 mt-auto">
        <a className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400" href="#">
          <Icon name="home" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Home</p>
        </a>
        <a className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400" href="#">
          <Icon name="local_shipping" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Moves</p>
        </a>
        <a className="flex flex-1 flex-col items-center justify-center gap-1 text-primary" href="#">
          <Icon name="account_balance_wallet" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Earnings</p>
        </a>
        <a className="flex flex-1 flex-col items-center justify-center gap-1 text-slate-400" href="#">
          <Icon name="person" />
          <p className="text-[10px] font-bold uppercase tracking-wider">Profile</p>
        </a>
      </div>
    </div>
  );
};
