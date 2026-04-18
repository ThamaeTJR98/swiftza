import React, { useState } from 'react';
import { Icon } from '../../../../Icons';

interface Props {
    onConfirm: (price: number, notes: string) => void;
    onCancel: () => void;
}

export const AdjustMoveQuote: React.FC<Props> = ({ onConfirm, onCancel }) => {
  const [adjustments, setAdjustments] = useState([
    { id: 1, name: 'Undeclared Wardrobe', price: 250, count: 1, type: 'item' },
    { id: 2, name: 'Stair Surcharge', price: 150, count: 1, type: 'fee' }
  ]);

  const originalQuote = 4800;
  const adjustmentTotal = adjustments.reduce((acc, item) => acc + (item.price * item.count), 0);
  const newTotal = originalQuote + adjustmentTotal;

  const handleIncrement = (id: number) => {
    setAdjustments(prev => prev.map(item => item.id === id ? { ...item, count: item.count + 1 } : item));
  };

  const handleDecrement = (id: number) => {
    setAdjustments(prev => prev.map(item => item.id === id ? { ...item, count: Math.max(0, item.count - 1) } : item));
  };

  const handleToggle = (id: number) => {
      setAdjustments(prev => prev.map(item => item.id === id ? { ...item, count: item.count === 0 ? 1 : 0 } : item));
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col justify-end bg-slate-900/60 backdrop-blur-sm">
        <div className="flex flex-col items-stretch bg-white rounded-t-[2.5rem] max-h-[90%] shadow-2xl border-t border-slate-200 animate-slide-up w-full">
            {/* Handle */}
            <div className="flex h-6 w-full items-center justify-center pt-2 shrink-0">
                <div className="h-1 w-10 rounded-full bg-slate-200"></div>
            </div>
            
            {/* Header */}
            <div className="px-5 pt-2 pb-2 shrink-0">
                <h2 className="text-xl font-black leading-tight tracking-tight text-slate-900">Adjust Quote</h2>
                <p className="text-slate-500 text-[10px] font-medium mt-0.5">Add additional items or surcharges discovered on-site.</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {/* Undeclared Wardrobe Item */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-brand-teal flex items-center justify-center rounded-lg bg-brand-teal/10 shrink-0 size-10">
                            <Icon name="checkroom" className="text-xl" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-slate-900 text-sm font-bold truncate">Undeclared Wardrobe</p>
                            <p className="text-slate-400 text-[10px] font-medium">R 250.00 per unit</p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-slate-200">
                            <button onClick={() => handleDecrement(1)} className="text-brand-teal hover:bg-brand-teal/10 rounded-full transition-colors">
                                <Icon name="remove_circle" className="text-base" />
                            </button>
                            <span className="text-slate-900 font-black text-xs min-w-[1rem] text-center">{adjustments.find(i => i.id === 1)?.count}</span>
                            <button onClick={() => handleIncrement(1)} className="text-brand-teal hover:bg-brand-teal/10 rounded-full transition-colors">
                                <Icon name="add_circle" className="text-base" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stair Surcharge Item */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="text-brand-teal flex items-center justify-center rounded-lg bg-brand-teal/10 shrink-0 size-10">
                            <Icon name="stairs" className="text-xl" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <p className="text-slate-900 text-sm font-bold truncate">Stair Surcharge</p>
                            <p className="text-slate-400 text-[10px] font-medium">R 150.00 flat fee</p>
                        </div>
                    </div>
                    <div className="shrink-0">
                        <label className="relative flex h-6 w-10 cursor-pointer items-center rounded-full border-none bg-slate-200 p-0.5 transition-all duration-200">
                            <input 
                                type="checkbox" 
                                checked={adjustments.find(i => i.id === 2)?.count! > 0} 
                                onChange={() => handleToggle(2)}
                                className="peer sr-only"
                            />
                            <div className="h-full w-5 rounded-full bg-white shadow-md peer-checked:translate-x-[16px] transition-all"></div>
                            <div className="absolute inset-0 rounded-full bg-brand-teal opacity-0 peer-checked:opacity-100 transition-opacity -z-10"></div>
                        </label>
                    </div>
                </div>

                {/* Custom Item */}
                <button className="w-full flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200 active:scale-95 transition-all">
                    <div className="text-slate-300 flex items-center justify-center rounded-lg bg-slate-100 shrink-0 size-10">
                        <Icon name="add_box" className="text-xl" />
                    </div>
                    <p className="text-slate-400 text-xs font-bold">Add other item...</p>
                </button>

                {/* Total Calculation Section */}
                <div className="mt-4 border-t border-slate-100 pt-4 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>Original Quote</span>
                        <span>R {originalQuote.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-brand-teal font-black uppercase tracking-widest">
                        <span>Adjustments</span>
                        <span>+ R {adjustmentTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase tracking-[0.2em] text-slate-400 font-black">New Total</span>
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">R {newTotal.toFixed(2)}</span>
                        </div>
                        <div className="text-right pb-1">
                            <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Incl. VAT (15%)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div className="shrink-0 p-5 pb-8 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex gap-2.5">
                    <button 
                        onClick={onCancel}
                        className="flex-1 h-12 bg-slate-100 text-slate-600 font-bold rounded-xl active:scale-95 transition-all text-xs"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onConfirm(newTotal, "Adjustments made")}
                        className="flex-[2] h-12 bg-brand-teal text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-teal/20 active:scale-[0.98] transition-all"
                    >
                        <Icon name="send" className="text-sm" />
                        <span>Send to Client</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
