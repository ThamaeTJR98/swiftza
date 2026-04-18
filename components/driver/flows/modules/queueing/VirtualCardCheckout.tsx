import React, { useState, useEffect } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onBack: () => void;
    amount: number;
    merchantName: string;
    itemsCount: number;
}

export const VirtualCardCheckout: React.FC<Props> = ({ onBack, amount, merchantName, itemsCount }) => {
    const [timeLeft, setTimeLeft] = useState(118); // 01:58 in seconds
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
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
            <header className="flex items-center justify-between px-6 py-4 shrink-0">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50">
                    <Icon name="arrow_back" className="text-slate-900" />
                </button>
                <h1 className="text-lg font-bold tracking-tight">Runner Checkout</h1>
                <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-200/50">
                    <Icon name="info" className="text-slate-900" />
                </button>
            </header>

            {/* Main Content - Compact & No Scroll */}
            <main className="flex-1 flex flex-col px-6 gap-4 overflow-hidden">
                {/* Security Timer */}
                <div className="flex flex-col items-center justify-center py-2 shrink-0">
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-600 rounded-full border border-purple-200">
                        <Icon name="timer" className="text-sm" />
                        <span className="text-sm font-bold tracking-wider">{formatTime(timeLeft)} REMAINING</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Card expires after session ends</p>
                </div>

                {/* Virtual Card */}
                <div className="relative w-full aspect-[1.586/1] rounded-2xl p-6 text-white overflow-hidden shadow-xl bg-gradient-to-br from-purple-600 to-orange-500 shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-20">
                        <Icon name="shopping_bag" className="text-9xl" />
                    </div>
                    <div className="relative h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-medium opacity-80 uppercase tracking-widest">Runner Card</span>
                                <span className="text-lg font-bold tracking-tight">SwiftZA</span>
                            </div>
                            <Icon name="contactless" className="text-3xl" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-7 bg-yellow-400/20 rounded-md border border-white/20 flex items-center justify-center">
                                    <div className="grid grid-cols-2 gap-0.5">
                                        <div className="w-1.5 h-1.5 bg-white/40 rounded-sm"></div>
                                        <div className="w-1.5 h-1.5 bg-white/40 rounded-sm"></div>
                                        <div className="w-1.5 h-1.5 bg-white/40 rounded-sm"></div>
                                        <div className="w-1.5 h-1.5 bg-white/40 rounded-sm"></div>
                                    </div>
                                </div>
                                <span className="text-lg font-medium tracking-[0.2em]">•••• •••• •••• 4582</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] uppercase opacity-70">Expiry</span>
                                        <span className="text-xs font-medium">08/26</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] uppercase opacity-70">CVV</span>
                                        <span className="text-xs font-medium">{showDetails ? '123' : '***'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] uppercase opacity-70">Status</span>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-300">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                        ACTIVE
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status and Authorization Info */}
                <div className="space-y-2 shrink-0">
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 flex items-center justify-center rounded-xl">
                            <Icon name="lock" className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Merchant Locked</p>
                            <p className="text-xs font-bold text-slate-800">{merchantName}</p>
                        </div>
                        <Icon name="verified" className="text-green-500 text-lg" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Authorized Amount</p>
                            <p className="text-lg font-black text-slate-900">R{amount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Total Errands</p>
                            <p className="text-xs font-bold">{itemsCount} Items</p>
                        </div>
                    </div>
                </div>

                {/* Terminal Instruction */}
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg scale-150 animate-pulse"></div>
                        <div className="relative w-20 h-20 bg-white rounded-full border-4 border-purple-500 flex items-center justify-center shadow-lg">
                            <Icon name="nfc" className="text-4xl text-purple-600" />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-lg font-black tracking-tight mb-0.5">Hold near terminal</h2>
                        <p className="text-slate-500 text-[11px] max-w-[200px]">Position your phone close to the card reader to pay</p>
                    </div>
                </div>
            </main>

            {/* Bottom Navigation / Action */}
            <nav className="bg-white/80 backdrop-blur-md border-t border-slate-200 px-6 py-3 shrink-0">
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                    >
                        <Icon name="visibility" className="text-sm" />
                        {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                    <button className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center transition-all active:scale-95">
                        <Icon name="help" className="text-slate-600" />
                    </button>
                </div>
            </nav>
        </div>
    );
};
