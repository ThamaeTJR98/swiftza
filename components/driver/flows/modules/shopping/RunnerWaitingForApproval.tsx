import React, { useEffect, useState } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    originalTotal: number;
    newTotal: number;
    onCancelRequest: () => void;
}

export const RunnerWaitingForApproval: React.FC<Props> = ({ originalTotal, newTotal, onCancelRequest }) => {
    const increaseAmount = newTotal - originalTotal;
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative flex h-[100dvh] w-full max-w-md mx-auto flex-col bg-[#f8f6f6] text-slate-900 font-sans animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="shrink-0 flex items-center bg-white p-4 justify-between border-b border-slate-200">
                <div className="w-10"></div>
                <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight flex-1 text-center">Awaiting Approval</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-violet-500/20 rounded-full animate-ping"></div>
                    <div className="relative size-24 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                        <Icon name="hourglass_empty" className="text-4xl animate-pulse" />
                    </div>
                </div>
                
                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Waiting for Customer</h3>
                <p className="text-slate-500 text-sm mb-6">
                    We've sent a request to the customer to approve the additional <span className="font-bold text-slate-900">R{increaseAmount.toFixed(2)}</span>.
                </p>

                <div className="bg-white rounded-xl border border-slate-200 p-4 w-full max-w-xs shadow-sm">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Time Elapsed</p>
                    <p className="text-3xl font-mono font-bold text-slate-900">{formatTime(elapsedTime)}</p>
                </div>
            </div>

            <div className="shrink-0 p-4 bg-white border-t border-slate-200">
                <button 
                    onClick={onCancelRequest}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
                >
                    Cancel Request
                </button>
            </div>
        </div>
    );
};
