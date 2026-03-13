import React, { useState, useEffect } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    amount: number;
    expenseType: string;
    onComplete: () => void;
}

export const VirtualCardActivation: React.FC<Props> = ({ amount, expenseType, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(120);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="fixed inset-0 z-[99999] flex h-[100dvh] w-full flex-col bg-slate-50 font-sans overflow-hidden animate-slide-up">
            {/* Header */}
            <header className="shrink-0 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                    <div className="size-9 bg-brand-teal/10 rounded-full flex items-center justify-center">
                        <Icon name="bolt" className="text-brand-teal text-lg" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-tight">Card Active</h1>
                        <p className="text-[10px] text-slate-500 font-medium">{expenseType}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
                    <Icon name="timer" className="text-[10px]" />
                    <span className="text-[10px] font-black tabular-nums">{formatTime(timeLeft)}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 flex flex-col items-center overflow-y-auto">
                {/* Virtual Card */}
                <div className="relative w-full max-w-[320px] aspect-[1.58/1] rounded-2xl p-5 text-white overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-white/10 shrink-0">
                    {/* Glossy Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                    
                    <div className="relative h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black opacity-50 uppercase tracking-widest">INCIDENTAL CARD</span>
                                <span className="text-lg font-black tracking-tight italic">SWIFT<span className="text-brand-teal">ZA</span></span>
                            </div>
                            <Icon name="contactless" className="text-xl opacity-60" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-7 bg-amber-400/90 rounded border border-amber-200/30 flex items-center justify-center shadow-inner">
                                <div className="grid grid-cols-2 gap-0.5">
                                    <div className="size-1.5 bg-black/20 rounded-sm"></div>
                                    <div className="size-1.5 bg-black/20 rounded-sm"></div>
                                    <div className="size-1.5 bg-black/20 rounded-sm"></div>
                                    <div className="size-1.5 bg-black/20 rounded-sm"></div>
                                </div>
                            </div>
                            <span className="text-base font-mono tracking-[0.2em] font-black">•••• 8821</span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[7px] uppercase opacity-40 font-black">EXPIRY</span>
                                    <span className="text-[10px] font-black">09/26</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[7px] uppercase opacity-40 font-black">CVV</span>
                                    <span className="text-[10px] font-black">***</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[7px] uppercase opacity-40 font-black">LIMIT</span>
                                <p className="text-base font-black text-brand-teal leading-none">R {amount.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 text-center space-y-4 max-w-xs">
                    <div className="relative inline-flex">
                        <div className="absolute inset-0 bg-brand-teal/20 rounded-full blur-xl animate-pulse"></div>
                        <div className="relative size-16 bg-white rounded-full border-4 border-brand-teal flex items-center justify-center shadow-xl">
                            <Icon name="nfc" className="text-3xl text-brand-teal" />
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-lg font-black tracking-tight mb-1">Ready to Tap</h2>
                        <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                            Hold your phone near the merchant's contactless terminal to pay for the <strong>{expenseType}</strong>.
                        </p>
                    </div>

                    <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center gap-3 text-left">
                        <Icon name="security" className="text-brand-teal shrink-0 text-sm" />
                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                            This card is single-use and restricted to the authorized amount. It will be deactivated immediately after transaction.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <div className="shrink-0 p-4 pb-8 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <button 
                    onClick={onComplete}
                    className="w-full h-14 bg-slate-900 text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-xl active:scale-[0.98] transition-all"
                >
                    Done / Back to Job
                </button>
            </div>
        </div>
    );
};
