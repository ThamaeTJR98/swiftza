import React, { useState, useEffect } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onAccessGranted: () => void;
    onMessageClient: () => void;
}

export const GateAccessDelay: React.FC<Props> = ({ onAccessGranted, onMessageClient }) => {
  const [seconds, setSeconds] = useState(45);
  const [minutes, setMinutes] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev === 59) {
          setMinutes(m => m + 1);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-slate-200 font-sans animate-slide-up">
        {/* Background Map */}
        <div className="absolute inset-0">
            <div className="w-full h-full bg-cover bg-center opacity-40 grayscale-[30%]" style={{ backgroundImage: "url('https://picsum.photos/seed/gate/800/1200')" }}></div>
        </div>

        {/* Top Status Bar */}
        <div className="relative z-10 p-3 flex justify-between items-center bg-white/90 backdrop-blur-sm border-b border-slate-200">
            <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-full bg-brand-teal flex items-center justify-center text-white shadow-sm">
                    <Icon name="local_shipping" className="text-lg" />
                </div>
                <div>
                    <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase">Current Task</p>
                    <p className="font-bold text-sm text-slate-800 truncate max-w-[180px]">Silver Oak Estate Entry</p>
                </div>
            </div>
            <button className="size-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                <Icon name="more_vert" />
            </button>
        </div>

        {/* Modal Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end bg-slate-900/40 backdrop-blur-[1px]">
            <div className="bg-white rounded-t-[2.5rem] shadow-2xl border-t border-slate-200 w-full animate-slide-up">
                {/* Pull Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="h-1 w-10 rounded-full bg-slate-200"></div>
                </div>

                <div className="px-6 py-4">
                    <div className="text-center mb-5">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black mb-3 uppercase tracking-widest border border-amber-100">
                            <Icon name="warning" className="text-xs" />
                            Gate Access Delay
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Waiting for Entry</h2>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Pending security clearance at North Gate</p>
                    </div>

                    {/* Timer Component */}
                    <div className="flex items-center justify-center gap-3 mb-5">
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="size-16 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                <span className="text-3xl font-black text-brand-teal tabular-nums">{minutes.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Min</span>
                        </div>
                        <div className="text-2xl font-black text-slate-200 pb-4">:</div>
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="size-16 flex items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                <span className="text-3xl font-black text-brand-teal tabular-nums">{seconds.toString().padStart(2, '0')}</span>
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Sec</span>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-brand-teal/5 rounded-xl p-3 border border-brand-teal/10 mb-6">
                        <div className="flex gap-3 items-start">
                            <Icon name="info" className="text-brand-teal text-sm mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-slate-800">Wait Fee Policy</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-medium">Wait fees of <span className="font-black text-brand-teal">R15.00/min</span> apply after 10 minutes of arrival.</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2.5 pb-8">
                        <button 
                            onClick={onAccessGranted}
                            className="w-full h-14 bg-brand-teal text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/20 active:scale-[0.98] transition-all"
                        >
                            <Icon name="check_circle" />
                            <span>Access Granted</span>
                        </button>
                        <button 
                            onClick={onMessageClient}
                            className="w-full h-12 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <Icon name="chat_bubble" />
                            <span>Message Client</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
