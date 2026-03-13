import React, { useState } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    progress: number;
    timeStarted: string;
    timeLeft: string;
    payout: number;
}

export const RunnerAbandonQueueReason: React.FC<Props> = ({ onConfirm, onCancel, progress, timeStarted, timeLeft, payout }) => {
  const [reason, setReason] = useState('Personal Emergency');

  const reasons = [
      "Personal Emergency",
      "App Issues",
      "Venue Conditions",
      "Other"
  ];

  return (
    <div className="fixed inset-0 z-50 flex h-[100dvh] w-full flex-col bg-slate-50 font-sans animate-slide-up overflow-hidden">
        {/* Compact Header */}
        <div className="flex items-center px-4 py-3 justify-between bg-white border-b border-slate-100 shrink-0">
            <button onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                <Icon name="close" className="text-xl text-slate-900" />
            </button>
            <h2 className="text-base font-bold text-slate-900">Leave Queue Early</h2>
            <div className="w-8"></div>
        </div>

        {/* Main Content - Scrollable if needed but designed to fit */}
        <div className="flex-1 flex flex-col px-4 py-2 gap-3 overflow-y-auto">
            
            {/* Progress Card - Compact */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 shrink-0">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</span>
                    <span className="text-brand-teal text-xs font-bold">{progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-brand-teal transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Started {timeStarted}</span>
                    <span>~{timeLeft} left</span>
                </div>
            </div>

            {/* Reasons Grid */}
            <div className="shrink-0">
                <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Reason</h3>
                <div className="grid grid-cols-2 gap-2">
                    {reasons.map((r) => (
                        <button
                            key={r}
                            onClick={() => setReason(r)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                                reason === r 
                                ? 'bg-brand-teal/10 border-brand-teal ring-1 ring-brand-teal' 
                                : 'bg-white border-slate-200 hover:border-brand-teal/50'
                            }`}
                        >
                            <span className={`text-xs font-bold ${reason === r ? 'text-brand-teal-dark' : 'text-slate-600'}`}>
                                {r}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Payout Summary - Compact */}
            <div className="shrink-0">
                <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wide">Payout Impact</h3>
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600">Earned so far</span>
                        <span className="text-xs font-bold text-slate-900">R {payout.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-600">Early exit penalty (15%)</span>
                        <span className="text-xs font-bold text-red-500">- R {(payout * 0.15).toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-orange-200 my-1"></div>
                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs font-bold text-slate-900">Final Payout</span>
                        <span className="text-sm font-black text-orange-600">R {(payout * 0.85).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Info Note */}
            <div className="flex gap-2 p-2 bg-slate-50 rounded-lg shrink-0">
                <Icon name="info" className="text-slate-400 text-sm mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-snug">
                    Leaving early affects your rating. Repeated exits may limit access to priority queues.
                </p>
            </div>
        </div>

        {/* Action Buttons - Fixed Bottom */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0 flex flex-col gap-2">
            <button 
                onClick={() => onConfirm(reason)}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all text-sm uppercase tracking-wide"
            >
                Confirm Exit
            </button>
            <button 
                onClick={onCancel}
                className="w-full bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors text-sm"
            >
                Stay in Queue
            </button>
        </div>
    </div>
  );
};
