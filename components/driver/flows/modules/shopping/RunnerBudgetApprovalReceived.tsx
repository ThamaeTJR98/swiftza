import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    originalTotal: number;
    newTotal: number;
    onProceed: () => void;
}

export const RunnerBudgetApprovalReceived: React.FC<Props> = ({ originalTotal, newTotal, onProceed }) => {
  const increaseAmount = newTotal - originalTotal;

  return (
    <div className="relative flex h-[100dvh] w-full max-w-md mx-auto flex-col bg-slate-50 overflow-hidden border-x border-violet-500/10 font-sans animate-slide-up">
        {/* Top Bar */}
        <div className="shrink-0 flex items-center p-4 pb-2 justify-between bg-slate-50 border-b border-slate-200 z-10">
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Budget Approved</h2>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <div className="size-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2 shadow-lg shadow-emerald-500/20">
                    <Icon name="check_circle" className="text-5xl font-bold" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900">Increase Approved!</h3>
                <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">
                    The customer has approved the budget increase of <span className="font-bold text-slate-900">R{increaseAmount.toFixed(2)}</span>.
                </p>
                <div className="bg-white border border-slate-200 rounded-xl p-4 w-full mt-4 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-500 text-sm">New Total Budget</span>
                        <span className="text-slate-900 font-bold text-lg">R{newTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-emerald-600 font-medium text-left">
                        Funds have been added to your virtual card.
                    </p>
                </div>
            </div>
        </div>

        {/* Footer Action - Fixed Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe-action bg-white/90 backdrop-blur-md border-t border-slate-200 z-20">
            <button 
                onClick={onProceed}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] tracking-wide"
            >
                <span>Proceed to Checkout</span>
                <Icon name="arrow_forward" />
            </button>
        </div>
    </div>
  );
};
