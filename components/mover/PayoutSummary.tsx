import React from 'react';
import { Icon } from '../Icons';

export const PayoutSummary: React.FC = () => {
  return (
    <div className="relative flex h-auto min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background-light text-slate-900 antialiased">
      {/* Top Navigation */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <div className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors cursor-pointer text-slate-900">
          <Icon name="arrow_back" />
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Job Completion</h2>
      </div>
      
      <div className="px-4 pb-6 pt-8">
        <h2 className="text-[28px] font-extrabold leading-tight tracking-tight">Final Settlement</h2>
        <p className="text-slate-500 text-sm mt-1">Review your earnings for Job #8829</p>
      </div>
      
      {/* Profit Highlight Card */}
      <div className="p-4">
        <div className="flex flex-col items-stretch justify-start rounded-xl shadow-lg border border-primary/10 bg-white overflow-hidden">
          <div className="w-full bg-center bg-no-repeat aspect-video bg-cover relative" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA-CcbAlSAfoGYfKDwXllZy_oHbmz2vYBWH5yjg3Swa3BMqrShiSJ_Ga2FbhFiko5cS4IvdPHtY3mYZGebYLR-cNHJIuYSynln5QO_yRbVXJg01S-IOo1yWDDohej8xo5gTgwjLOg6WTqBzYZSDYrdwFkQCWAkMuiRL2DxwFRezlGL_nqkamXYVS8Y5KCpRDd3MuFSKLdtwZEa9qo6AI7MaTq29iA_lZEZHDq1TkV9_1X_i0tMwoSiTOqMqpijQ9pQKtqxLALXj4KU0')" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Verified Payout</span>
            </div>
          </div>
          <div className="flex w-full min-w-72 grow flex-col items-center justify-center gap-2 py-8 px-6 text-center">
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Net Profit</p>
            <p className="text-primary text-5xl font-black leading-tight tracking-tight">R1,180</p>
            <div className="flex items-center gap-2 mt-2">
              <Icon name="check_circle" className="text-green-500 text-sm" />
              <p className="text-slate-600 text-sm font-normal">Total payout after adjustments</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Earnings Breakdown */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="receipt_long" className="text-primary" />
          <h3 className="text-lg font-bold leading-tight tracking-tight">Earnings Breakdown</h3>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-slate-900 text-sm font-semibold">Base Move Fee</p>
              <p className="text-slate-500 text-xs">Standard rate for 20km</p>
            </div>
            <p className="text-slate-900 text-sm font-bold">R850</p>
          </div>
          <div className="h-px bg-slate-100 w-full"></div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-slate-900 text-sm font-semibold">Helper Fees</p>
              <p className="text-slate-500 text-xs">2x Helpers for 2 hours</p>
            </div>
            <p className="text-slate-900 text-sm font-bold">R200</p>
          </div>
          <div className="h-px bg-slate-100 w-full"></div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-slate-900 text-sm font-semibold">Extra Items Adjustment</p>
              <p className="text-slate-500 text-xs">Additional piano & safe</p>
            </div>
            <p className="text-slate-900 text-sm font-bold">R300</p>
          </div>
          <div className="h-px bg-slate-100 w-full"></div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-primary text-sm font-semibold italic">Platform Commission</p>
              <p className="text-slate-500 text-xs">15% Service fee</p>
            </div>
            <p className="text-primary text-sm font-bold">-R170</p>
          </div>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="mt-auto p-4 pb-safe-action">
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <span>Finish Job</span>
          <Icon name="task_alt" />
        </button>
      </div>
    </div>
  );
};
