import React, { useState, useEffect } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    amount: number;
    startTime: number;
    status: 'ACTIVE' | 'INACTIVE';
    merchantName: string;
    itemsCount: number;
    onPaymentComplete: () => void;
    onCancel: () => void;
}

export const RunnerVirtualCardCheckout: React.FC<Props> = ({ amount, startTime, status, merchantName, itemsCount, onPaymentComplete, onCancel }) => {
    const [timeLeft, setTimeLeft] = useState(Math.max(0, 120 - Math.floor((Date.now() - startTime) / 1000)));
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showJitModal, setShowJitModal] = useState(false);

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
        <div className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-slate-50 font-sans overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 shrink-0">
                <button onClick={onCancel} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200/50">
                    <Icon name="arrow_back" className="text-slate-900 text-lg" />
                </button>
                <h1 className="text-sm font-bold tracking-tight">Runner Checkout</h1>
                <button onClick={() => setShowInfoModal(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-200/50">
                    <Icon name="info" className="text-slate-900 text-lg" />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 overflow-y-auto pb-20 flex flex-col gap-3">
                {/* Security Timer */}
                <div className="flex flex-col items-center justify-center py-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-600 rounded-full border border-purple-200">
                        <Icon name="timer" className="text-xs" />
                        <span className="text-xs font-bold tracking-wider">{formatTime(timeLeft)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Card expires after session ends</p>
                </div>

                {/* Virtual Card - New Design */}
                <div className="relative w-full aspect-[1.8/1] rounded-2xl p-5 text-white overflow-hidden shadow-xl bg-gradient-to-br from-purple-600 to-orange-500">
                    <div className="relative h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-medium opacity-80 uppercase tracking-widest">RUNNER CARD</span>
                                <span className="text-lg font-bold tracking-widest">SwiftZA</span>
                            </div>
                            <Icon name="contactless" className="text-2xl" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="w-10 h-7 bg-white/20 rounded-md border border-white/20 flex items-center justify-center">
                                <div className="grid grid-cols-2 gap-0.5">
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
                                    <div className="w-1.5 h-1.5 bg-white/60 rounded-sm"></div>
                                </div>
                            </div>
                            <span className="text-sm font-medium tracking-[0.1em]">•••• 4582</span>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase opacity-70">EXPIRY</span>
                                    <span className="text-[10px] font-medium">08/26</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] uppercase opacity-70">CVV</span>
                                    <span className="text-[10px] font-medium">***</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] uppercase opacity-70">STATUS</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                    <span className={`w-1.5 h-1.5 rounded-full ${status === 'ACTIVE' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                                    {status}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status and Authorization Info - Compact Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 flex items-center justify-center rounded-lg shrink-0">
                            <Icon name="lock" className="text-purple-600 text-sm" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter truncate">Merchant</p>
                            <p className="text-[10px] font-bold text-slate-800 truncate">{merchantName}</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                        <div>
                            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Amount</p>
                            <p className="text-sm font-black text-slate-900">R{amount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Items</p>
                            <p className="text-sm font-bold text-slate-900">{itemsCount}</p>
                        </div>
                    </div>
                </div>

                {/* Terminal Instruction - Compact */}
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <div className="relative w-16 h-16 bg-white rounded-full border-2 border-purple-500 flex items-center justify-center shadow-md">
                        <Icon name="nfc" className="text-3xl text-purple-600" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-sm font-black tracking-tight">Hold near terminal</h2>
                        <p className="text-slate-500 text-[10px]">Position phone close to reader</p>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation / Action */}
            <nav className="bg-white/80 backdrop-blur-md border-t border-slate-200 px-4 py-3 shrink-0">
                <div className="flex gap-3">
                    <button 
                        onClick={onPaymentComplete}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                    >
                        <Icon name="visibility" className="text-sm" />
                        Show Details
                    </button>
                    <button 
                        onClick={() => setShowJitModal(true)}
                        className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    >
                        <Icon name="help" className="text-slate-600 text-lg" />
                    </button>
                </div>
            </nav>

            {/* Modals */}
            {(showInfoModal || showJitModal) && (
                <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <h3 className="text-lg font-bold mb-2">{showInfoModal ? 'Card Info' : 'How JIT Funding Works'}</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            {showInfoModal 
                                ? 'This is a secure, temporary virtual card generated for this specific errand. It is locked to the merchant and will expire automatically.'
                                : 'JIT (Just-In-Time) Funding: The card is automatically loaded with the exact authorized amount just before you tap. This ensures secure, controlled spending for your errand.'}
                        </p>
                        <button 
                            onClick={() => { setShowInfoModal(false); setShowJitModal(false); }}
                            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
