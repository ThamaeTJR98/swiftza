import React, { useState } from 'react';
import { Icon } from '../../../../Icons';
import { ErrandItem } from '../../../../../types';

interface Props {
    originalTotal: number;
    newTotal: number;
    items: ErrandItem[];
    onRequest: (reason: string) => void;
    onCancel: () => void;
}

export const RunnerBudgetIncreaseRequest: React.FC<Props> = ({ originalTotal, newTotal, items, onRequest, onCancel }) => {
  const [reason, setReason] = useState('Price hike at shelf');
  const difference = newTotal - originalTotal;
  
  // Find items where actual price is greater than estimated price
  const affectedItems = items.filter(item => {
      const actual = item.actualPrice !== undefined ? item.actualPrice : (item.estimatedPrice || 0);
      return actual > (item.estimatedPrice || 0);
  });

  return (
    <div className="relative flex h-[100dvh] w-full max-w-md mx-auto flex-col bg-slate-50 overflow-hidden border-x border-violet-500/10 font-sans animate-slide-up">
        {/* Top Bar */}
        <div className="shrink-0 flex items-center p-4 pb-2 justify-between bg-slate-50 border-b border-slate-200 z-10">
            <div onClick={onCancel} className="text-violet-500 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-violet-500/10 cursor-pointer transition-colors">
                <Icon name="arrow_back" />
            </div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Budget Increase</h2>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 pb-24">
            {/* Summary Header */}
            <div className="flex flex-col gap-1">
                <h3 className="text-slate-900 text-lg font-bold leading-tight">Increase Details</h3>
                <p className="text-slate-500 text-sm">The shelf price is higher than the app estimation.</p>
            </div>

            {/* Price Gap Card */}
            <div className="flex flex-wrap gap-4">
                <div className="flex min-w-[158px] flex-1 flex-col gap-1 rounded-xl p-4 border border-violet-500/20 bg-violet-500/5">
                    <p className="text-violet-500 text-xs font-semibold uppercase tracking-wider">Price Gap</p>
                    <p className="text-slate-900 tracking-tight text-2xl font-extrabold leading-tight">R{difference.toFixed(2)}</p>
                </div>
            </div>

            {/* Input Reason */}
            <div className="flex flex-col gap-2">
                <label className="flex flex-col w-full">
                    <p className="text-slate-900 text-sm font-semibold leading-normal pb-1">Reason for increase</p>
                    <select 
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="flex w-full rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/50 border border-violet-500/20 bg-white h-12 px-3 text-sm font-normal leading-normal shadow-sm"
                    >
                        <option value="Price hike at shelf">Price hike at shelf</option>
                        <option value="Item weight/quantity difference">Item weight/quantity difference</option>
                        <option value="Customer added items via chat">Customer added items via chat</option>
                        <option value="Unexpected store surcharge">Unexpected store surcharge</option>
                    </select>
                </label>
            </div>

            {/* Affected Items (Dynamic) */}
            <div className="flex flex-col gap-2 mt-1">
                <h3 className="text-slate-900 text-sm font-semibold leading-tight">Affected Items</h3>
                {affectedItems.length > 0 ? (
                    <div className="flex flex-col gap-1 bg-white rounded-xl border border-slate-100 p-1.5">
                        {affectedItems.map(item => (
                            <label key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-violet-500 focus:ring-violet-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                                    <div className="flex gap-2 items-center">
                                        <p className="text-xs text-slate-500 line-through">Est: R{item.estimatedPrice?.toFixed(2)}</p>
                                        <p className="text-xs font-bold text-red-500">Actual: R{item.actualPrice?.toFixed(2)}</p>
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-500 text-center">No specific items marked higher than estimate. Increase may be due to added items.</p>
                    </div>
                )}
            </div>

            {/* Warning/Info Note */}
            <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <Icon name="info" className="text-amber-600 text-sm mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">Requests over 30% of estimated budget total may require manual verification by the support team.</p>
            </div>
        </div>

        {/* Footer Action - Fixed Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe-action bg-white/90 backdrop-blur-md border-t border-slate-200 z-20">
            <button 
                onClick={() => onRequest(reason)}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
                <span>Send for Approval</span>
                <Icon name="send" className="text-base" />
            </button>
            <p className="text-center text-slate-400 text-[10px] uppercase tracking-wider mt-3 font-medium">Estimated response time: 2-3 minutes</p>
        </div>
    </div>
  );
};
