import React from 'react';
import { Icon } from '../Icons';

export const UnloadingVerification: React.FC = () => {
  return (
    <div className="relative flex h-auto min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background-light text-slate-900 antialiased">
      <header className="flex items-center bg-white p-4 sticky top-0 z-10 border-b border-slate-200">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 cursor-pointer">
          <Icon name="arrow_back" className="text-slate-700" />
        </div>
        <div className="flex flex-col ml-3">
          <h2 className="text-lg font-bold leading-tight tracking-tight">Unloading Manifest</h2>
          <p className="text-xs text-slate-500">Job #MV-8829 • Destination Arrival</p>
        </div>
      </header>
      
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight">Items Verification</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">1 of 12 Pending</span>
          </div>
          <div className="space-y-1 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <label className="flex items-center gap-x-4 p-4 border-b border-slate-100 cursor-pointer active:bg-slate-50 transition-colors">
              <div className="flex-1">
                <p className="text-base font-semibold">Master Bedroom King Bed</p>
                <p className="text-xs text-slate-500">ID: FUR-001 • Heavy</p>
              </div>
              <input type="checkbox" className="h-6 w-6 rounded-lg border-slate-300 bg-transparent text-primary focus:ring-primary focus:ring-offset-0" defaultChecked />
            </label>
            <label className="flex items-center gap-x-4 p-4 border-b border-slate-100 cursor-pointer active:bg-slate-50 transition-colors">
              <div className="flex-1">
                <p className="text-base font-semibold text-slate-900">Dining Table - Glass Top</p>
                <p className="text-xs text-slate-500">ID: FUR-042 • Fragile</p>
              </div>
              <input type="checkbox" className="h-6 w-6 rounded-lg border-slate-300 bg-transparent text-primary focus:ring-primary focus:ring-offset-0" />
            </label>
          </div>
        </section>
        
        <section className="mb-6">
          <h3 className="text-lg font-bold mb-3">Proof of Unloading</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative group cursor-pointer aspect-square bg-slate-200 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-primary transition-colors">
              <Icon name="add_a_photo" className="text-3xl text-slate-400 group-hover:text-primary mb-2" />
              <p className="text-xs font-semibold text-slate-500 group-hover:text-primary">New Photo</p>
            </div>
          </div>
        </section>
        
        <div className="pb-10">
          <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
            <Icon name="check_circle" />
            Complete Unloading
          </button>
          <p className="text-center text-xs text-slate-500 mt-4">By completing, you confirm all selected items are safely offloaded at destination.</p>
        </div>
      </main>
    </div>
  );
};
