import React, { useState } from 'react';
import { Icon } from '../../../../Icons';
import { RideRequest, ErrandItem } from '../../../../../types';

interface Props {
    ride: RideRequest;
    onConfirm: () => void;
    onReportDiscrepancy: () => void;
}

export const PreInspectionManifest: React.FC<Props> = ({ ride, onConfirm, onReportDiscrepancy }) => {
  const [localItems, setLocalItems] = useState<ErrandItem[]>(ride.errandDetails?.items || []);
  const [verifiedItems, setVerifiedItems] = useState<Record<string, boolean>>({});
  const [newItemName, setNewItemName] = useState('');

  const toggleVerify = (id: string) => {
    setVerifiedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addItem = () => {
      if (!newItemName) return;
      const newItem: ErrandItem = {
          id: Date.now().toString(),
          name: newItemName,
          quantity: '1',
          status: 'PENDING'
      };
      setLocalItems([...localItems, newItem]);
      setNewItemName('');
  };

  const allVerified = localItems.length > 0 && localItems.every((item: any) => verifiedItems[item.id]);

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans animate-slide-up">
        {/* Top Navigation Bar */}
        <header className="shrink-0 flex items-center bg-white p-4 border-b border-slate-200 justify-between">
            <div className="flex items-center gap-3">
                <h1 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Pre-Inspection</h1>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-brand-teal/10 rounded-full">
                <Icon name="local_shipping" className="text-brand-teal text-sm" />
                <span className="text-brand-teal text-xs font-semibold">Job ID: #{ride.id.slice(-4)}</span>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto">
            {/* Header Section */}
            <div className="px-4 pt-6 pb-2">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-slate-900 text-xl font-bold tracking-tight">
                            {ride.errandDetails?.packageSize || 'Move Items'}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            Reviewing {localItems.length} items for {ride.errandDetails?.recipientName || 'Customer'}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Quote</span>
                        <p className="text-brand-teal font-bold">R {ride.price.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* List of Items */}
            <div className="flex flex-col gap-3 p-4">
                {localItems.map((item: any) => (
                    <div key={item.id} className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${verifiedItems[item.id] ? 'border-brand-teal/50 bg-brand-teal/5' : 'border-slate-200'}`}>
                        <div className="flex gap-4 items-start">
                            <div className="bg-slate-100 rounded-lg size-16 flex items-center justify-center border border-slate-200">
                                <Icon name="inventory_2" className="text-slate-400 text-2xl" />
                            </div>
                            <div className="flex flex-1 flex-col justify-between min-h-[64px]">
                                <div>
                                    <p className="text-slate-900 text-base font-bold leading-tight">{item.name}</p>
                                    <p className="text-slate-500 text-xs mt-1 line-clamp-1">{item.description || 'No description provided'}</p>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    <Icon name="info" className="text-[10px] text-slate-400" />
                                    <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Qty: {item.quantity}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button 
                                onClick={() => toggleVerify(item.id)}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-lg h-10 px-4 text-sm font-semibold transition-all ${verifiedItems[item.id] ? 'bg-brand-teal text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                <Icon name={verifiedItems[item.id] ? "check_circle" : "radio_button_unchecked"} className="text-lg" />
                                <span>{verifiedItems[item.id] ? 'Verified' : 'Verify Item'}</span>
                            </button>
                            <button className="flex items-center justify-center rounded-lg h-10 w-12 bg-slate-100 text-slate-400 border border-slate-200">
                                <Icon name="add_a_photo" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Item Input */}
                <div className="flex gap-2 mt-2">
                    <input 
                        type="text" 
                        value={newItemName} 
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Add new item..."
                        className="flex-1 p-3 rounded-xl border border-slate-200 bg-white text-sm"
                    />
                    <button onClick={addItem} className="bg-brand-teal text-white px-4 rounded-xl font-bold">Add</button>
                </div>

                {localItems.length === 0 && (
                    <div className="py-12 text-center">
                        <Icon name="inventory" className="text-4xl text-slate-300 mb-2 mx-auto" />
                        <p className="text-slate-500">No items listed in manifest</p>
                    </div>
                )}
            </div>

            {/* Warning Section */}
            <div className="mx-4 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-8">
                <div className="flex gap-3">
                    <Icon name="info" className="text-amber-600 shrink-0" />
                    <div>
                        <p className="text-amber-900 text-sm font-bold">Scope Check</p>
                        <p className="text-amber-700 text-xs leading-relaxed">Extra items or larger items? Use the adjustment tool before starting.</p>
                    </div>
                </div>
            </div>
        </main>

        {/* Footer Actions */}
        <footer className="shrink-0 p-4 bg-white border-t border-slate-200 space-y-3">
            <button 
                onClick={onReportDiscrepancy}
                className="w-full h-12 bg-slate-100 text-slate-900 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-sm"
            >
                Report Discrepancy
            </button>
            <button 
                onClick={onConfirm}
                disabled={!allVerified}
                className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${allVerified ? 'bg-brand-teal text-white shadow-brand-teal/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
                Confirm Inspection
            </button>
        </footer>
    </div>
  );
};
