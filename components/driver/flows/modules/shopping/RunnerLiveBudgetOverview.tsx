import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    originalTotal: number;
    actualTotal: number;
    onRequestIncrease: () => void;
    onProceedToQueue: () => void;
    onBackToChecklist: () => void;
    onMessages: () => void;
}

export const RunnerLiveBudgetOverview: React.FC<Props> = ({ originalTotal, actualTotal, onRequestIncrease, onProceedToQueue, onBackToChecklist, onMessages }) => {
    const buffer = originalTotal * 0.10;
    const isOverBudget = actualTotal > (originalTotal + buffer);
    const overage = isOverBudget ? actualTotal - (originalTotal + buffer) : 0;
    const totalDifference = actualTotal - originalTotal;
    const percentage = originalTotal > 0 ? Math.round((totalDifference / originalTotal) * 100) : 0;
    
    // Calculate progress bar width (max 100%)
    const progressPercentage = originalTotal > 0 ? Math.min((actualTotal / (originalTotal + buffer)) * 100, 100) : 0;

    return (
        <div className="relative flex h-[100dvh] w-full max-w-md mx-auto flex-col bg-[#f8f6f6] text-slate-900 font-sans animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center bg-white p-3 justify-between border-b border-slate-200">
                <div onClick={onBackToChecklist} className="text-slate-900 flex size-10 shrink-0 items-center justify-center cursor-pointer rounded-full hover:bg-slate-100 transition-colors">
                    <Icon name="arrow_back" className="text-xl" />
                </div>
                <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight flex-1 text-center">Active Shopping</h2>
                <div className="flex w-10 items-center justify-end">
                    <button className="flex items-center justify-center rounded-full size-10 hover:bg-slate-100 transition-colors text-slate-900">
                        <Icon name="info" className="text-xl" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="shrink-0 bg-white">
                <div className="flex border-b border-slate-200 px-2 justify-between">
                    <div onClick={onBackToChecklist} className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-slate-500 pb-2 pt-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold leading-normal tracking-wide">Checklist</p>
                    </div>
                    <div className="flex flex-col items-center justify-center border-b-[3px] border-b-violet-500 text-violet-500 pb-2 pt-3 flex-1">
                        <p className="text-xs font-bold leading-normal tracking-wide">Live Budget</p>
                    </div>
                    <div onClick={onMessages} className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-slate-500 pb-2 pt-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                        <p className="text-xs font-bold leading-normal tracking-wide">Messages</p>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {/* Summary Card */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col items-center text-center">
                    {isOverBudget ? (
                        <div className="mb-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Over Budget ({percentage}%)
                        </div>
                    ) : (
                        <div className="mb-2 px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            Within Budget
                        </div>
                    )}
                    
                    <h3 className="text-slate-900 tracking-tight text-3xl font-extrabold leading-tight pt-1">R{actualTotal.toFixed(2)}</h3>
                    <p className="text-slate-500 text-sm font-medium pb-4">Current Shopping Total</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div className={`h-2.5 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between w-full text-xs">
                        <span className="text-slate-500 font-medium">Est: R{originalTotal.toFixed(2)}</span>
                        <span className={`font-bold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                            {totalDifference > 0 ? '+' : ''}R{totalDifference.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                    <h4 className="text-slate-900 font-bold px-1 text-sm">Budget Breakdown</h4>
                    <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
                        <div className="p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-violet-500/10 rounded-lg text-violet-500">
                                    <Icon name="receipt_long" className="text-lg" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">Original Estimate</p>
                                    <p className="text-[11px] text-slate-500">Fixed at request</p>
                                </div>
                            </div>
                            <p className="font-bold text-slate-900 text-sm">R{originalTotal.toFixed(2)}</p>
                        </div>
                        <div className="p-3 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                                    <Icon name="shield" className="text-lg" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">10% Buffer</p>
                                    <p className="text-[11px] text-slate-500">Allowed overage</p>
                                </div>
                            </div>
                            <p className="font-bold text-slate-900 text-sm">R{buffer.toFixed(2)}</p>
                        </div>
                        
                        {isOverBudget && (
                            <div className="p-3 flex justify-between items-center bg-red-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                                        <Icon name="warning" className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-red-600 text-sm">Current Overage</p>
                                        <p className="text-[11px] text-red-500">Exceeds buffer</p>
                                    </div>
                                </div>
                                <p className="font-bold text-red-600 text-sm">R{overage.toFixed(2)}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Action Area - Fixed at bottom */}
            <div className="shrink-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                {isOverBudget ? (
                    <>
                        <div className="bg-violet-500/5 p-3 rounded-xl border border-violet-500/20 mb-3">
                            <p className="text-xs text-slate-700 text-center leading-relaxed">
                                The current total exceeds the client's pre-approved 10% buffer. Please request a budget increase to proceed.
                            </p>
                        </div>
                        <button 
                            onClick={onRequestIncrease}
                            className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <Icon name="add_card" className="text-lg" />
                            Request Budget Increase
                        </button>
                    </>
                ) : (
                    <>
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 mb-3">
                            <p className="text-xs text-emerald-800 text-center font-medium leading-relaxed">
                                Shopping total is within the approved budget. You can proceed to checkout.
                            </p>
                        </div>
                        <button 
                            onClick={onProceedToQueue}
                            className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            Proceed to Checkout
                            <Icon name="arrow_forward" className="text-lg" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
