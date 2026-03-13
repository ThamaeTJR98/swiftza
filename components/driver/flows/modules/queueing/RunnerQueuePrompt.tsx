import React from 'react';
import { Icon } from '../../../../Icons';
import { motion } from 'motion/react';

interface Props {
    onYes: () => void;
    onNo: () => void;
}

export const RunnerQueuePrompt: React.FC<Props> = ({ onYes, onNo }) => {
  return (
    <div className="relative flex h-auto min-h-[100dvh] w-full max-w-md mx-auto flex-col bg-slate-50 overflow-x-hidden border-x border-violet-500/10 font-sans animate-slide-up">
        {/* Top Bar */}
        <div className="flex items-center p-4 pb-2 justify-between bg-slate-50 sticky top-0 z-10">
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Checkout Queue</h2>
        </div>

        {/* Content Body */}
        <div className="flex flex-col gap-6 p-4 flex-1 justify-center items-center text-center">
            <div className="size-24 rounded-full bg-violet-100 flex items-center justify-center mb-2">
                <Icon name="people" className="text-violet-600 !text-5xl" />
            </div>
            
            <h3 className="text-2xl font-extrabold text-slate-900">Is there a long queue?</h3>
            <p className="text-slate-500 text-sm max-w-[280px]">
                If the checkout queue is long, you can start the queue timer to be compensated for your waiting time.
            </p>

            <div className="flex flex-col w-full gap-3 mt-8">
                <button 
                    onClick={onYes}
                    className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <Icon name="timer" />
                    <span>Yes, start queue timer</span>
                </button>
                <button 
                    onClick={onNo}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <span>No, proceed to pay</span>
                    <Icon name="arrow_forward" />
                </button>
            </div>
        </div>
    </div>
  );
};
