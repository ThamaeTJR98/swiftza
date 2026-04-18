import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    totalEarnings: number;
    onFinish: () => void;
}

export const MoveEarningsSummary: React.FC<Props> = ({ totalEarnings, onFinish }) => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-900 animate-slide-up">
        {/* Header */}
        <div className="shrink-0 flex items-center p-3 justify-between border-b border-slate-200 bg-white z-10">
            <button onClick={onFinish} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <Icon name="arrow_back" />
            </button>
            <h2 className="text-base font-bold flex-1 text-center">Job Summary</h2>
            <div className="size-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-6">
                <h2 className="text-2xl font-black leading-tight tracking-tight">Final Settlement</h2>
                <p className="text-slate-500 text-xs mt-1">Review your earnings for Job #8829</p>
            </div>

            {/* Profit Card */}
            <div className="px-4">
                <div className="flex flex-col items-stretch rounded-2xl shadow-xl border border-brand-orange/10 bg-white overflow-hidden">
                    <div className="w-full aspect-[21/9] bg-slate-200 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-brand-orange/5"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon name="payments" className="text-5xl text-brand-orange/20" />
                        </div>
                        <div className="absolute bottom-3 left-3">
                            <span className="bg-brand-orange text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Verified Payout</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Net Profit</p>
                        <p className="text-brand-orange text-5xl font-black leading-none tracking-tighter">R1,180</p>
                        <div className="flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-green-50 border border-green-100">
                            <Icon name="check_circle" className="text-green-500 text-xs" />
                            <p className="text-green-600 text-[10px] font-bold">Total payout after adjustments</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="px-4 py-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Icon name="receipt_long" className="text-brand-orange text-lg" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Earnings Breakdown</h3>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-slate-900 text-sm font-bold truncate">Base Move Fee</p>
                            <p className="text-slate-400 text-[10px] font-medium">Standard rate for 20km</p>
                        </div>
                        <p className="text-slate-900 text-sm font-black">R850</p>
                    </div>
                    <div className="h-px bg-slate-50 w-full"></div>
                    <div className="flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-slate-900 text-sm font-bold truncate">Helper Fees</p>
                            <p className="text-slate-400 text-[10px] font-medium">2x Helpers for 2 hours</p>
                        </div>
                        <p className="text-slate-900 text-sm font-black">R200</p>
                    </div>
                    <div className="h-px bg-slate-50 w-full"></div>
                    <div className="flex justify-between items-center">
                        <div className="min-w-0">
                            <p className="text-brand-orange text-sm font-bold italic truncate">Platform Commission</p>
                            <p className="text-slate-400 text-[10px] font-medium">15% Service fee</p>
                        </div>
                        <p className="text-brand-orange text-sm font-black">-R170</p>
                    </div>
                </div>
            </div>

            {/* Policy */}
            <div className="px-4 pb-8">
                <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex gap-3">
                    <Icon name="info" className="text-slate-400 shrink-0 text-sm" />
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                        Funds will be transferred to your registered bank account within 24-48 business hours. For discrepancies, please contact partner support within 12 hours.
                    </p>
                </div>
            </div>
        </div>

        {/* Footer Action */}
        <div className="shrink-0 p-4 pb-8 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <button 
                onClick={onFinish} 
                className="w-full h-14 bg-brand-orange text-white rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-brand-orange/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                <span>Finish Job</span>
                <Icon name="task_alt" />
            </button>
        </div>
    </div>
  );
};
