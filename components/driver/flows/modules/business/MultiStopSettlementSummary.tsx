import React from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    stopsCompleted: number;
    totalExpenses: number;
    onFinish: () => void;
}

export const MultiStopSettlementSummary: React.FC<Props> = ({ stopsCompleted, totalExpenses, onFinish }) => {
  return (
    <div className="flex flex-col h-[100dvh] w-full p-6 animate-slide-up bg-white">
        <div className="mb-8 text-center pt-10">
            <div className="size-20 bg-brand-teal/10 text-brand-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="domain_verification" className="text-4xl" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Business Run Complete</h2>
            <p className="text-sm text-slate-500 mt-2">Summary of stops and expenses.</p>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4 mb-8">
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Stops Completed</span>
                <span className="text-xl font-black text-slate-900">{stopsCompleted}</span>
            </div>
            <div className="h-px bg-slate-200 w-full"></div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Expenses Logged</span>
                <span className="text-lg font-black text-red-500">R {totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">Reimbursement Status</span>
                <span className="text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-600 px-2 py-1 rounded">Pending</span>
            </div>
        </div>

        <div className="mt-auto pb-10">
            <button 
                onClick={onFinish}
                className="w-full h-16 bg-brand-teal text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-teal/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Icon name="check_circle" />
                Submit Report
            </button>
        </div>
    </div>
  );
};
