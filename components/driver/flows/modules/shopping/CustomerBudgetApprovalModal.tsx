import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    originalTotal: number;
    newTotal: number;
    reason: string;
    onApprove: () => void;
    onDecline: () => void;
}

export const CustomerBudgetApprovalModal: React.FC<Props> = ({ originalTotal, newTotal, reason, onApprove, onDecline }) => {
    const increaseAmount = newTotal - originalTotal;

    return (
        <div className="fixed inset-0 z-[99999] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onDecline}></div>
            <div className="bg-white w-full rounded-t-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col animate-slide-up pb-safe max-w-md mx-auto">
                <div className="flex h-6 w-full items-center justify-center shrink-0 mt-2">
                    <div className="h-1.5 w-12 rounded-full bg-slate-200"></div>
                </div>
                
                <div className="px-6 pb-8 pt-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <Icon name="warning" className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 leading-tight">Budget Increase Request</h2>
                            <p className="text-slate-500 text-sm">Your runner needs more funds.</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500 text-sm font-medium">Original Estimate</span>
                            <span className="text-slate-900 font-bold">R{originalTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500 text-sm font-medium">New Total</span>
                            <span className="text-slate-900 font-bold">R{newTotal.toFixed(2)}</span>
                        </div>
                        <div className="h-px w-full bg-slate-200 mb-4"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-amber-600 text-sm font-bold uppercase tracking-wider">Increase Amount</span>
                            <span className="text-amber-600 font-extrabold text-xl">+R{increaseAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h4 className="text-slate-900 font-bold text-sm mb-2">Runner's Note</h4>
                        <div className="bg-slate-100 rounded-xl p-3 border-l-4 border-violet-500">
                            <p className="text-slate-700 text-sm italic">"{reason}"</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={onApprove}
                            className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <Icon name="check" />
                            Approve Increase
                        </button>
                        <button 
                            onClick={onDecline}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
                        >
                            Decline & Ask to Remove Items
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
