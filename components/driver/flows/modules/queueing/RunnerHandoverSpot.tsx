import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    ride?: any;
    onHandoverComplete: () => void;
}

export const RunnerHandoverSpot: React.FC<Props> = ({ ride, onHandoverComplete }) => {
  const basePrice = ride?.price || 45;
  const queueFee = ride?.queueFee || 330; // Defaulting to 330 for now if not present, to match previous UI
  const totalEarned = basePrice + queueFee;

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-x-hidden bg-[#f8f6f6] text-slate-900 font-sans animate-slide-up">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
            <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Icon name="close" />
            </button>
            <h1 className="text-lg font-bold tracking-tight">Session Complete</h1>
            <div className="w-10"></div> {/* Spacer */}
        </header>

        <main className="flex-1 flex flex-col p-4 overflow-y-auto pb-24">
            {/* Success Animation Area */}
            <div className="flex flex-col items-center justify-center py-8">
                <div className="size-24 bg-green-500/10 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-[spin_3s_linear_infinite] border-t-transparent"></div>
                    <Icon name="check_circle" className="text-5xl text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                    {ride?.errandDetails?.category === 'BANK_QUEUE' ? 'Banking Complete' :
                     ride?.errandDetails?.category === 'GOVT_QUEUE' ? 'Queue Complete' :
                     'Session Complete'}
                </h2>
                <p className="text-slate-500 mt-1">
                    {ride?.errandDetails?.category === 'BANK_QUEUE' ? 'Teller service finished' :
                     ride?.errandDetails?.category === 'GOVT_QUEUE' ? 'Counter service finished' :
                     'Handover successful'}
                </p>
            </div>

            {/* Receipt Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden">
                {/* Receipt jagged edge effect (simulated with border) */}
                <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cG9seWdvbiBwb2ludHM9IjAsMCA0LDggOCwwIiBmaWxsPSIjZjhmNmY2Ii8+Cjwvc3ZnPg==')] bg-repeat-x"></div>
                
                <div className="text-center mb-6 pt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Earnings</p>
                    <h3 className="text-5xl font-bold text-slate-900 tracking-tighter">R {totalEarned.toFixed(2)}</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 border-dashed">
                        <span className="text-slate-500">Base Fee</span>
                        <span className="font-semibold text-slate-900">R {basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 border-dashed">
                        <div className="flex flex-col">
                            <span className="text-slate-500">Time (2h 12m)</span>
                            <span className="text-xs text-slate-400">@ R2.50/min</span>
                        </div>
                        <span className="font-semibold text-slate-900">R {queueFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-slate-900">Total Payout</span>
                        <span className="font-bold text-orange-500 text-lg">R {totalEarned.toFixed(2)}</span>
                    </div>
                </div>

                {/* Escrow Release Note */}
                <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3 items-start">
                    <Icon name="lock_open" className="text-green-600 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-green-800">Funds Released</p>
                        <p className="text-xs text-green-700 mt-0.5">The escrow payment has been released to your SwiftZA wallet.</p>
                    </div>
                </div>
            </div>

            {/* Rating Section */}
            <div className="mt-6 flex flex-col items-center gap-3">
                <p className="text-sm font-bold text-slate-500">Rate the Client</p>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="size-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 hover:text-orange-500 hover:border-orange-500 transition-colors">
                            <Icon name="star" className="text-2xl" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto pt-8">
                <button 
                    onClick={onHandoverComplete}
                    className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                >
                    RETURN TO HOME
                </button>
            </div>
        </main>
    </div>
  );
};
