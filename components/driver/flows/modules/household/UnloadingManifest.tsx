import React, { useState } from 'react';
import { Icon } from '../../../../Icons';
import { RideRequest, ErrandItem } from '../../../../../types';

interface Props {
  ride: RideRequest;
  onComplete: () => void;
}

export const UnloadingManifest: React.FC<Props> = ({ ride, onComplete }) => {
  const initialItems = ride.errandDetails?.items || [];
  const [items, setItems] = useState<ErrandItem[]>(initialItems);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [report, setReport] = useState('');

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = items.length;
  const allChecked = totalCount > 0 && checkedCount === totalCount;

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased">
      <header className="shrink-0 flex items-center bg-white p-4 border-b border-slate-200">
        <div className="flex flex-col">
          <h2 className="text-lg font-bold leading-tight tracking-tight">Unloading Manifest</h2>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Job #{ride.id.slice(-4)} • Destination Arrival</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Items Verification</h3>
            <span className="bg-brand-orange/10 text-brand-orange text-[10px] font-bold px-2 py-0.5 rounded-full">
                {totalCount - checkedCount} Pending
            </span>
          </div>
          <div className="space-y-2">
            {items.map(item => (
                <label key={item.id} className={`flex items-center gap-x-4 p-4 bg-white rounded-xl border transition-all cursor-pointer ${checkedItems[item.id] ? 'border-brand-orange/30 bg-brand-orange/5' : 'border-slate-200'}`}>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${checkedItems[item.id] ? 'text-slate-400 line-through' : ''}`}>{item.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{item.description || 'No description'}</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={!!checkedItems[item.id]}
                        onChange={() => toggleItem(item.id)}
                        className="h-6 w-6 rounded-lg border-slate-300 bg-transparent text-brand-orange focus:ring-brand-orange focus:ring-offset-0" 
                    />
                </label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Proof of Unloading</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative group cursor-pointer aspect-square bg-slate-100 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-brand-orange transition-colors">
              <Icon name="add_a_photo" className="text-2xl text-slate-400 group-hover:text-brand-orange mb-1" />
              <p className="text-[10px] font-bold text-slate-500 group-hover:text-brand-orange">New Photo</p>
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-200 bg-cover bg-center shadow-inner" style={{ backgroundImage: "url('https://picsum.photos/seed/truck/400/400')" }}>
              <div className="absolute inset-0 bg-black/20 flex items-end p-2">
                <span className="text-[8px] text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded uppercase font-bold">Truck View</span>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Condition Report</h3>
            <button className="flex items-center gap-1 text-brand-orange text-xs font-bold">
              <Icon name="mic" className="text-base" />
              <span>Dictate</span>
            </button>
          </div>
          <textarea 
            value={report}
            onChange={(e) => setReport(e.target.value)}
            className="w-full h-24 p-3 rounded-xl border-slate-200 bg-white text-slate-700 focus:ring-brand-orange focus:border-brand-orange placeholder:text-slate-400 text-xs" 
            placeholder="Note any damages or specific unloading details here..."
          ></textarea>
        </section>
      </main>

      <footer className="shrink-0 p-4 pb-8 bg-white border-t border-slate-200">
          <button 
            onClick={onComplete} 
            disabled={!allChecked}
            className={`w-full h-14 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${allChecked ? 'bg-brand-orange text-white shadow-brand-orange/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Icon name="check_circle" />
            Complete Unloading
          </button>
          <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">Confirm all items are safely offloaded at destination.</p>
      </footer>
    </div>
  );
};
