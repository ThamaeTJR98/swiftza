import React from 'react';
import { Icon } from '../../../../Icons';
import { ErrandItem } from '../../../../../types';

interface Props {
    items: ErrandItem[];
    onUpdateItem: (id: string, updates: Partial<ErrandItem>) => void;
    onSubstitute: (item: ErrandItem) => void;
    onStartQueue: () => void;
    onCheckout: () => void;
    onMessages: () => void;
    onBack: () => void;
    onMenu: () => void;
}

export const RunnerShoppingChecklist: React.FC<Props> = ({ items, onUpdateItem, onSubstitute, onStartQueue, onCheckout, onMessages, onBack, onMenu }) => {
  const foundCount = items.filter(i => i.status === 'FOUND').length;
  const progress = items.length > 0 ? (foundCount / items.length) * 100 : 0;
  const totalEstimated = items.reduce((acc, curr) => {
      if (curr.status !== 'FOUND' && curr.status !== 'SUBSTITUTED') return acc;
      const qty = parseInt(curr.quantity) || 1;
      const price = curr.actualPrice !== undefined ? curr.actualPrice : (curr.estimatedPrice || 0);
      return acc + (price * qty);
  }, 0);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#fbfaff] font-sans">
        {/* Header */}
        <div className="shrink-0 flex items-center bg-[#fbfaff] p-4 pb-2 justify-between border-b border-slate-100 z-10">
            <button 
                onClick={onBack}
                className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
                <Icon name="arrow_back" />
            </button>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 ml-2">Active Order</h2>
            <button 
                onClick={onMenu}
                className="text-slate-900 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
                <Icon name="more_vert" />
            </button>
        </div>

        {/* Tabs */}
        <div className="shrink-0 bg-white">
            <div className="flex border-b border-slate-200 px-2 justify-between">
                <div className="flex flex-col items-center justify-center border-b-[3px] border-b-violet-500 text-violet-500 pb-2 pt-3 flex-1">
                    <p className="text-xs font-bold leading-normal tracking-wide">Checklist</p>
                </div>
                <div onClick={onCheckout} className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-slate-500 pb-2 pt-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-bold leading-normal tracking-wide">Live Budget</p>
                </div>
                <div onClick={onMessages} className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-slate-500 pb-2 pt-3 flex-1 cursor-pointer hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-bold leading-normal tracking-wide">Messages</p>
                </div>
            </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-32">
            {/* Progress Section */}
            <div className="flex flex-col gap-3 p-4 bg-white shadow-sm mb-4">
                <div className="flex gap-6 justify-between items-end">
                    <div>
                        <p className="text-slate-900 text-base font-bold leading-normal">Shopping Progress</p>
                        <p className="text-slate-500 text-sm font-normal leading-normal">{foundCount} of {items.length} items picked</p>
                    </div>
                    <p className="text-violet-500 text-sm font-bold leading-normal">{Math.round(progress)}%</p>
                </div>
                <div className="rounded-full bg-slate-200 h-3 w-full overflow-hidden">
                    <div className="h-full rounded-full bg-violet-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Checklist */}
            <div className="px-4 space-y-3">
                {items.map(item => (
                    <div key={item.id} className={`flex flex-col bg-white rounded-xl border p-3 shadow-sm transition-all ${item.status === 'FOUND' ? 'border-violet-200 bg-violet-50/30' : 'border-slate-200'}`}>
                        <div className="flex items-start gap-3 mb-2">
                            <div 
                                onClick={() => onUpdateItem(item.id, { status: item.status === 'FOUND' ? 'PENDING' : 'FOUND' })}
                                className={`mt-0.5 h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors ${item.status === 'FOUND' ? 'bg-violet-500 border-violet-500 text-white' : 'border-slate-300 bg-transparent text-transparent hover:border-violet-400'}`}
                            >
                                 <Icon name="check" className="text-sm" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <p className={`text-slate-900 text-sm font-bold leading-tight truncate ${item.status === 'FOUND' ? 'line-through opacity-60' : ''}`}>{item.name}</p>
                                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">x{item.quantity}</span>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    {item.brand && (
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${item.status === 'FOUND' ? 'bg-slate-200/50 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                                            {item.brand}
                                        </span>
                                    )}
                                    <span className={`text-xs font-medium ${item.status === 'FOUND' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Est: R {item.estimatedPrice?.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 gap-2">
                            <div className="flex items-center bg-slate-50 rounded-lg px-2 py-1 border border-slate-200 focus-within:border-violet-500 focus-within:ring-1 focus-within:ring-violet-500 transition-all w-24 shrink-0">
                                <span className="text-xs text-slate-400 mr-1 font-medium">R</span>
                                <input 
                                    type="number" 
                                    placeholder={item.estimatedPrice?.toFixed(2)}
                                    value={item.actualPrice !== undefined ? item.actualPrice : ''}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        onUpdateItem(item.id, { actualPrice: isNaN(val) ? undefined : val });
                                    }}
                                    className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none p-0 appearance-none"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                            
                            <div className="flex gap-1.5 flex-1 justify-end">
                                <button 
                                    onClick={() => onUpdateItem(item.id, { status: 'UNAVAILABLE' })}
                                    className={`flex items-center justify-center rounded-lg h-8 px-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${item.status === 'UNAVAILABLE' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    Missing
                                </button>
                                <button 
                                    onClick={() => onSubstitute(item)}
                                    className={`flex items-center justify-center rounded-lg h-8 px-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${item.status === 'SUBSTITUTED' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                >
                                    Sub
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Sticky Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto p-4 pb-safe-action bg-white/80 backdrop-blur-md border-t border-slate-200 z-20">
            <button 
                onClick={onCheckout}
                className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-violet-500 text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-violet-500/30"
            >
                <span className="truncate">Checkout Order (R {totalEstimated.toFixed(2)})</span>
            </button>
        </div>
    </div>
  );
};
