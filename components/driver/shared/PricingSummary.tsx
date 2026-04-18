import React from 'react';

interface Props {
  grossFare: number;
  commission: number;
  netProfit: number;
  paymentMethod: string;
}

export const PricingSummary: React.FC<Props> = ({ grossFare, commission, netProfit, paymentMethod }) => {
  return (
    <div className="w-full max-w-sm space-y-4 bg-slate-50 rounded-[2rem] p-6 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center text-sm font-bold">
        <span className="text-slate-500">Gross Fare</span>
        <span className="text-slate-900">R {grossFare.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center text-sm font-bold">
        <span className="text-slate-500">Payment Mode</span>
        <span className="text-brand-teal font-black text-[10px] uppercase bg-brand-teal/10 px-3 py-1 rounded-full">
          {paymentMethod}
        </span>
      </div>
      <div className="h-px bg-slate-200 w-full my-2 border-dashed border-b" />
      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
        <span className="uppercase tracking-widest">Platform (20%)</span>
        <span>- R {commission.toFixed(2)}</span>
      </div>
      <div className="flex justify-between items-center pt-2">
        <span className="text-slate-900 font-black text-lg uppercase tracking-tight">Net Profit</span>
        <span className="text-emerald-600 font-black text-3xl tracking-tighter">R {netProfit.toFixed(0)}</span>
      </div>
    </div>
  );
};
