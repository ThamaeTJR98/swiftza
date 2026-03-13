
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icons';

interface EscrowModalProps {
  amount: number;
  recipientName: string;
  onConfirm: () => void;
  onCancel: () => void;
  type: 'HOLD' | 'RELEASE';
}

type EscrowStep = 'INFO' | 'PIN' | 'PROCESSING' | 'SUCCESS';

export const EscrowModal: React.FC<EscrowModalProps> = ({ amount, recipientName, onConfirm, onCancel, type }) => {
  const [step, setStep] = useState<EscrowStep>('INFO');
  const [pin, setPin] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initiating Transaction...');

  useEffect(() => {
    if (step === 'PROCESSING') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('SUCCESS');
            return 100;
          }
          
          // Update status text based on progress
          if (prev === 20) setStatusText('Verifying Security Keys...');
          if (prev === 50) setStatusText(type === 'HOLD' ? 'Locking Funds in Vault...' : 'Releasing to Wallet...');
          if (prev === 80) setStatusText('Finalizing Ledger Entry...');
          
          return prev + 1;
        });
      }, 30); // ~3 seconds total
      return () => clearInterval(interval);
    }
  }, [step, type]);

  useEffect(() => {
    if (step === 'SUCCESS') {
      const timer = setTimeout(() => {
        onConfirm();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step, onConfirm]);

  const handlePinSubmit = () => {
    if (pin.length === 4) {
      setStep('PROCESSING');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in font-sans">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl animate-scale-up relative overflow-hidden">
        
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-slate-50 rounded-t-[2.5rem] -z-10"></div>

        {step === 'INFO' && (
            <>
                <div className={`size-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg ${type === 'HOLD' ? 'bg-slate-900 text-white' : 'bg-brand-teal text-slate-900'}`}>
                    <Icon name={type === 'HOLD' ? "lock" : "lock_open"} className="text-4xl" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                    {type === 'HOLD' ? 'Secure Payment Hold' : 'Release Payment'}
                </h3>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4">
                    {type === 'HOLD' 
                        ? `Funds will be held in a secure escrow vault until the job is completed.` 
                        : `You are about to release funds to ${recipientName}. This action is irreversible.`}
                </p>
                
                <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Icon name="account_balance_wallet" className="text-6xl text-slate-900" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-left">Total Amount</p>
                    <p className="text-4xl font-black text-slate-900 text-left tracking-tight">R {amount.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Verified Available</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => setStep('PIN')}
                        className={`w-full h-16 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 ${type === 'HOLD' ? 'bg-slate-900' : 'bg-brand-teal text-slate-900'}`}
                    >
                        {type === 'HOLD' ? 'Authorize Hold' : 'Release Funds'}
                        <Icon name="arrow_forward" className="text-lg" />
                    </button>
                    <button onClick={onCancel} className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 hover:text-slate-600 transition-colors">Cancel Transaction</button>
                </div>
            </>
        )}

        {step === 'PIN' && (
            <>
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setStep('INFO')} className="size-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"><Icon name="arrow_back" /></button>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Check</span>
                    <div className="size-10"></div>
                </div>
                
                <div className="mb-8">
                    <div className="size-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon name="dialpad" className="text-2xl" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-1">Enter Security PIN</h3>
                    <p className="text-slate-400 text-xs font-medium">Please verify it's you to proceed</p>
                </div>
                
                <div className="flex justify-center gap-3 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`size-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${pin[i] ? 'border-brand-teal bg-brand-teal/5 text-brand-teal shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-300'}`}>
                            {pin[i] ? '•' : ''}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-3 gap-x-4 gap-y-4 max-w-[260px] mx-auto mb-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => setPin(prev => (prev.length < 4 ? prev + num : prev))} className="h-14 rounded-2xl text-xl font-black text-slate-700 bg-slate-50 active:bg-slate-200 active:scale-95 transition-all hover:bg-slate-100">
                            {num}
                        </button>
                    ))}
                    <div />
                    <button onClick={() => setPin(prev => (prev.length < 4 ? prev + '0' : prev))} className="h-14 rounded-2xl text-xl font-black text-slate-700 bg-slate-50 active:bg-slate-200 active:scale-95 transition-all hover:bg-slate-100">0</button>
                    <button onClick={() => setPin(prev => prev.slice(0, -1))} className="h-14 rounded-2xl flex items-center justify-center text-slate-400 active:text-slate-800 hover:bg-slate-100 transition-all">
                        <Icon name="backspace" className="text-xl" />
                    </button>
                </div>

                <button 
                    disabled={pin.length !== 4}
                    onClick={handlePinSubmit}
                    className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Confirm & Process
                </button>
            </>
        )}

        {step === 'PROCESSING' && (
            <div className="py-12 flex flex-col items-center justify-center animate-fade-in">
                <div className="relative size-32 mb-8">
                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className="text-brand-teal transition-all duration-75 ease-linear" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-black text-slate-900">{progress}%</span>
                    </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-2">Processing...</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">{statusText}</p>
                
                <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                    <Icon name="lock" className="text-xs text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">256-bit Secure Encryption</span>
                </div>
            </div>
        )}

        {step === 'SUCCESS' && (
            <div className="py-8 animate-scale-up flex flex-col items-center">
                <div className="size-28 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100">
                    <Icon name="check_circle" className="text-6xl" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">Transaction Complete</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 px-6">
                    {type === 'HOLD' ? 'Funds have been successfully secured in the escrow vault.' : `Payment of R${amount.toFixed(2)} has been released to ${recipientName}.`}
                </p>
                
                <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</span>
                    <span className="text-[10px] font-mono font-bold text-slate-900">TX-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
            </div>
        )}

      </div>
    </div>,
    document.body
  );
};
