import React from 'react';
import { Icon } from '../../../../Icons';

export const DocumentVerificationScan: React.FC = () => {
  return (
    <div className="flex flex-col h-full p-6 animate-slide-up">
        <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Verify Documents</h2>
            <p className="text-sm text-slate-500 mt-2">Scan the documents to ensure you have the correct paperwork before leaving the office.</p>
        </div>

        <div className="flex-1 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            <Icon name="document_scanner" className="text-6xl text-slate-300" />
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Align Document Here</p>
            
            {/* Scanner laser animation */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-teal shadow-[0_0_15px_rgba(0,196,180,0.8)] animate-scan"></div>
        </div>

        <div className="mt-8">
            <button className="w-full h-16 bg-brand-teal text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-teal/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Icon name="camera" />
                Scan Document
            </button>
        </div>
    </div>
  );
};
