import React, { useState } from 'react';
import { Icon } from '../../../../Icons';
import { RideRequest, ErrandItem } from '../../../../../types';

interface Props {
    ride: RideRequest;
    type: 'LOADING' | 'UNLOADING';
    onComplete: () => void;
    onRequestFunds?: () => void;
}

export const LoadingManifest: React.FC<Props> = ({ ride, type, onComplete, onRequestFunds }) => {
  const initialItems = ride.errandDetails?.items || [];
  const [items, setItems] = useState<ErrandItem[]>(initialItems);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
  const allChecked = totalCount > 0 && checkedCount === totalCount;

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Header Section */}
      <header className="shrink-0 bg-white border-b border-slate-200">
        <div className="flex items-center p-4 justify-between">
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">
            {type === 'LOADING' ? 'Loading Manifest' : 'Unloading Manifest'}
          </h2>
          <div className="text-brand-orange flex size-10 shrink-0 items-center justify-center bg-brand-orange/10 rounded-full">
            <Icon name="camera_alt" />
          </div>
        </div>
        <div className="flex flex-col gap-3 p-4 pt-0">
          <div className="flex gap-6 justify-between items-end">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Job #{ride.id.slice(-4)}</p>
              <p className="text-slate-900 text-sm font-semibold truncate max-w-[200px]">
                {ride.errandDetails?.packageSize || 'Residential Move'}
              </p>
            </div>
            <p className="text-brand-orange text-sm font-bold leading-normal">{checkedCount} / {totalCount} items</p>
          </div>
          <div className="rounded-full bg-brand-orange/20 h-2 overflow-hidden">
            <div className="h-full rounded-full bg-brand-orange transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <h3 className="text-slate-900 text-sm font-bold uppercase tracking-wider">Inventory Checklist</h3>
          <span className="text-[10px] bg-slate-200 px-2 py-1 rounded text-slate-600 font-bold">{totalCount} TOTAL</span>
        </div>

        <div className="divide-y divide-slate-100">
            {items.map(item => (
            <div key={item.id} className={`flex items-center gap-4 px-4 min-h-[80px] py-3 justify-between transition-colors ${checkedItems[item.id] ? 'bg-brand-orange/5' : ''}`}>
                <div className="flex items-center gap-4 flex-1">
                <div className="flex size-8 items-center justify-center shrink-0">
                    <input 
                    type="checkbox" 
                    checked={!!checkedItems[item.id]}
                    onChange={() => toggleItem(item.id)}
                    className={`h-6 w-6 rounded border-2 cursor-pointer focus:ring-brand-orange focus:ring-offset-0 focus:outline-none transition-all ${checkedItems[item.id] ? 'border-brand-orange bg-brand-orange text-white' : 'border-slate-300 bg-transparent text-brand-orange'}`} 
                    />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                    <p className={`text-sm font-bold leading-tight truncate ${checkedItems[item.id] ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {item.name}
                    </p>
                    <p className="text-slate-500 text-xs leading-normal truncate">{item.description || 'No description'}</p>
                </div>
                </div>
                <div className="flex gap-2 shrink-0">
                {checkedItems[item.id] ? (
                    <div className="flex items-center justify-center size-10">
                    <Icon name="check_circle" className="text-green-500" />
                    </div>
                ) : (
                    <>
                    <button className="text-slate-400 hover:text-brand-orange flex size-10 items-center justify-center rounded-full hover:bg-brand-orange/10 transition-colors">
                        <Icon name="photo_camera" className="text-lg" />
                    </button>
                    </>
                )}
                </div>
            </div>
            ))}
        </div>

        {items.length === 0 && (
            <div className="py-20 text-center">
                <Icon name="inventory" className="text-4xl text-slate-200 mb-2 mx-auto" />
                <p className="text-slate-400 text-sm">No items to {type === 'LOADING' ? 'load' : 'unload'}</p>
            </div>
        )}
      </main>

      {/* Sticky Summary Footer */}
      <footer className="shrink-0 bg-white border-t border-slate-200 p-4 pb-8 space-y-3">
        {onRequestFunds && (
            <button 
                onClick={onRequestFunds}
                className="w-full h-12 bg-white text-brand-teal font-bold rounded-xl border-2 border-brand-teal/20 shadow-sm active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
                Request Materials / Funds
            </button>
        )}
        <div className="flex items-center justify-between max-w-2xl mx-auto gap-4">
          <div className="min-w-0">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">Status</p>
            <p className="text-slate-900 font-bold text-sm truncate">
                {checkedCount === totalCount ? 'Ready to proceed' : `Currently ${type === 'LOADING' ? 'loading' : 'unloading'}`}
            </p>
          </div>
          <button 
            onClick={onComplete}
            disabled={!allChecked}
            className={`flex-1 h-14 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95 ${allChecked ? 'bg-brand-orange text-white shadow-brand-orange/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            Finish {type === 'LOADING' ? 'Loading' : 'Unloading'}
          </button>
        </div>
      </footer>
    </div>
  );
};
