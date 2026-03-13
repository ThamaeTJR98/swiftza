import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

interface OtpKeypadProps {
  correctOtp: string;
  onVerify: () => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const OtpKeypad: React.FC<OtpKeypadProps> = ({ 
  correctOtp, 
  onVerify, 
  onClose, 
  title = "Verification", 
  subtitle = "Enter 4-Digit PIN" 
}) => {
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);

  const handleVerify = () => {
    if (otpInput === correctOtp) {
      onVerify();
    } else {
      setOtpError(true);
      setOtpInput('');
      setTimeout(() => setOtpError(false), 500);
    }
  };

  useEffect(() => {
    if (otpInput.length === 4) {
        // Optional: Auto-verify when 4 digits entered
        // handleVerify();
    }
  }, [otpInput]);

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col animate-slide-up">
      <div className="flex justify-between items-center px-6 pt-safe-top h-14 border-b border-slate-50">
        <button onClick={onClose} className="size-8 bg-slate-50 rounded-full flex items-center justify-center">
          <Icon name="close" className="text-lg" />
        </button>
        <h3 className="font-black text-sm text-slate-900 uppercase tracking-[0.1em]">{title}</h3>
        <div className="size-8"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-4">{subtitle}</p>
        <div className="flex gap-3 mb-8">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${otpError ? 'border-red-500 bg-red-50 text-red-500 animate-bounce' : otpInput[i] ? 'border-brand-teal bg-brand-teal/5 text-brand-teal' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
              {otpInput[i] || '•'}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full max-w-[280px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} onClick={() => setOtpInput(prev => (prev.length < 4 ? prev + num : prev))} className="h-12 rounded-xl text-xl font-black text-slate-700 bg-slate-50 active:bg-slate-200 active:scale-95 transition-all">
              {num}
            </button>
          ))}
          <div />
          <button onClick={() => setOtpInput(prev => (prev.length < 4 ? prev + '0' : prev))} className="h-12 rounded-xl text-xl font-black text-slate-700 bg-slate-50 active:bg-slate-200">
            0
          </button>
          <button onClick={() => setOtpInput(prev => prev.slice(0, -1))} className="h-12 rounded-xl flex items-center justify-center text-slate-400 active:text-slate-800">
            <span className="material-symbols-rounded text-2xl">backspace</span>
          </button>
        </div>
      </div>

      <div className="p-6 pb-safe">
        <button 
          disabled={otpInput.length !== 4} 
          onClick={handleVerify}
          className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all disabled:opacity-30 uppercase tracking-[0.2em]"
        >
          Verify & Continue
        </button>
      </div>
    </div>
  );
};
