import React, { useState } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onRequest: (type: string, amount: number) => void;
    onCancel: () => void;
}

export const RequestMaterialFunds: React.FC<Props> = ({ onRequest, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [expenseType, setExpenseType] = useState('Bubble Wrap');

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col justify-end bg-slate-950/60 backdrop-blur-sm">
        <div className="bg-white rounded-t-[2.5rem] shadow-2xl overflow-hidden max-w-lg mx-auto w-full border-t border-slate-200 animate-slide-up">
            {/* Drag Handle */}
            <div className="flex h-6 w-full items-center justify-center">
                <div className="h-1 w-10 rounded-full bg-slate-200"></div>
            </div>
            
            <div className="px-6 pt-2 pb-8">
                <header className="mb-5">
                    <h2 className="text-xl font-black leading-tight tracking-tight mb-1 text-slate-900">Request Funds</h2>
                    <p className="text-slate-500 text-xs font-medium">
                        Approval triggers an instant <strong>Virtual Card</strong>.
                    </p>
                </header>

                <div className="space-y-5">
                    {/* Category Selection */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Expense Type</p>
                        <div className="grid grid-cols-2 gap-2">
                            {['Bubble Wrap', 'Parking Fee', 'Tape', 'Boxes'].map((type) => (
                                <label key={type} className={`group relative flex items-center justify-center gap-2 rounded-xl border-2 px-3 h-12 cursor-pointer transition-all ${expenseType === type ? 'border-brand-teal bg-brand-teal/5 text-brand-teal' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
                                    <Icon name={type === 'Parking Fee' ? 'local_parking' : 'package_2'} className={`text-sm ${expenseType === type ? 'fill-current' : ''}`} />
                                    <span className="text-xs font-bold whitespace-nowrap">{type}</span>
                                    <input 
                                        type="radio" 
                                        name="expense-type" 
                                        className="invisible absolute" 
                                        checked={expenseType === type}
                                        onChange={() => setExpenseType(type)}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="flex flex-col">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Amount (ZAR)</p>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300">R</span>
                                <input 
                                    type="number" 
                                    className="w-full pl-10 pr-4 h-14 rounded-xl text-xl font-black border-2 border-slate-100 bg-slate-50 focus:border-brand-teal focus:ring-4 focus:ring-brand-teal/5 transition-all outline-none text-slate-900" 
                                    placeholder="0.00" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                            </div>
                        </label>
                    </div>

                    {/* Info Box */}
                    <div className="bg-brand-teal/5 border border-brand-teal/10 rounded-xl p-3 flex gap-3">
                        <Icon name="info" className="text-brand-teal text-sm mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            Approved funds will be provisioned to a secure virtual card for one-time use at merchant terminals.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2.5 pt-2">
                        <button 
                            onClick={onCancel}
                            className="flex-1 h-14 rounded-xl font-bold bg-slate-100 text-slate-600 active:scale-95 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => onRequest(expenseType, parseFloat(amount))}
                            className="flex-[2] h-14 rounded-xl font-black uppercase tracking-widest text-sm bg-brand-teal text-white shadow-lg shadow-brand-teal/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            <span>Request</span>
                            <Icon name="bolt" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
