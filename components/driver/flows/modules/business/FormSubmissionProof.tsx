import React, { useState } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onConfirm: () => void;
}

export const FormSubmissionProof: React.FC<Props> = ({ onConfirm }) => {
  const [photoTaken, setPhotoTaken] = useState(false);

  return (
    <div className="flex flex-col h-full p-6 animate-slide-up">
        <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 leading-tight">Submission Proof</h2>
            <p className="text-sm text-slate-500 mt-2">Take a photo of the stamped document or submission receipt.</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <button 
                onClick={() => setPhotoTaken(true)}
                className={`size-48 rounded-3xl border-4 border-dashed flex flex-col items-center justify-center gap-4 transition-all active:scale-95 ${photoTaken ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-100 border-slate-300 text-slate-400'}`}
            >
                {photoTaken ? (
                    <>
                        <Icon name="check_circle" className="text-5xl" />
                        <span className="text-xs font-black uppercase tracking-widest">Proof Captured</span>
                    </>
                ) : (
                    <>
                        <Icon name="document_scanner" className="text-5xl" />
                        <span className="text-xs font-black uppercase tracking-widest">Scan Stamped Doc</span>
                    </>
                )}
            </button>
        </div>

        <div className="mt-auto pt-8">
            <button 
                onClick={onConfirm}
                disabled={!photoTaken}
                className="w-full h-16 bg-brand-teal text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-teal/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
                <Icon name="verified" />
                Confirm Submission
            </button>
        </div>
    </div>
  );
};
