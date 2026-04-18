import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icons';

interface IncidentalCostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, reason: string) => void;
    title?: string;
}

export const IncidentalCostModal: React.FC<IncidentalCostModalProps> = ({ isOpen, onClose, onConfirm, title = "Request Incidental Funds" }) => {
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('Parking');

    if (!isOpen) return null;

    const handleSubmit = () => {
        const val = parseFloat(amount);
        if (val > 0 && reason.trim()) {
            onConfirm(val, reason);
            setAmount('');
            setReason('Parking');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop Simulation */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-0" onClick={onClose}></div>
            
            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-scale-up">
                {/* BottomSheetHandle Style Header for Modal */}
                <div className="flex flex-col items-center pt-3">
                    <div className="h-1.5 w-12 rounded-full bg-slate-300 mb-4"></div>
                </div>
                
                <div className="px-6 pb-8">
                    {/* Header Section */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
                        <p className="text-slate-500 text-sm mt-1">Select a category and enter the required amount for your current task.</p>
                    </div>
                    
                    {/* Category Selection */}
                    <div className="mb-6">
                        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Category</p>
                        <div className="flex flex-wrap gap-3">
                            <label className={`group relative flex items-center justify-center rounded-xl border-2 px-5 h-12 cursor-pointer transition-all ${reason === 'Parking' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-700 hover:border-primary/50'}`}>
                                <Icon name="local_parking" className="mr-2 text-xl" />
                                <span className="text-sm font-medium">Parking</span>
                                <input type="radio" name="category" value="Parking" checked={reason === 'Parking'} onChange={(e) => setReason(e.target.value)} className="sr-only" />
                            </label>
                            <label className={`group relative flex items-center justify-center rounded-xl border-2 px-5 h-12 cursor-pointer transition-all ${reason === 'Official Forms' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-700 hover:border-primary/50'}`}>
                                <Icon name="description" className="mr-2 text-xl" />
                                <span className="text-sm font-medium">Official Forms</span>
                                <input type="radio" name="category" value="Official Forms" checked={reason === 'Official Forms'} onChange={(e) => setReason(e.target.value)} className="sr-only" />
                            </label>
                            <label className={`group relative flex items-center justify-center rounded-xl border-2 px-5 h-12 cursor-pointer transition-all ${reason === 'Other' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-700 hover:border-primary/50'}`}>
                                <Icon name="more_horiz" className="mr-2 text-xl" />
                                <span className="text-sm font-medium">Other</span>
                                <input type="radio" name="category" value="Other" checked={reason === 'Other'} onChange={(e) => setReason(e.target.value)} className="sr-only" />
                            </label>
                        </div>
                    </div>
                    
                    {/* Amount Input */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
                            Amount (ZAR)
                        </label>
                        <div className="relative flex items-center">
                            <div className="absolute left-4 text-slate-400 font-medium">
                                R
                            </div>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00" 
                                step="0.01" 
                                className="block w-full pl-9 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xl font-semibold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" 
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2 italic">* Please ensure you have a digital copy of the receipt ready.</p>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleSubmit}
                            disabled={!amount || !reason}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:shadow-none"
                        >
                            <span>Request Funds</span>
                            <Icon name="send" className="text-lg group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full bg-transparent hover:bg-slate-100 text-slate-500 font-medium py-3 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
                
                {/* Footer / Runner Status */}
                <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Icon name="person" className="text-primary text-sm" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-700">Runner Active</p>
                            <p className="text-[10px] text-slate-500">Current Session</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Live</span>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
