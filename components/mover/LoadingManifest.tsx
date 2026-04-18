import React from 'react';
import { Icon } from '../Icons';

export const LoadingManifest: React.FC = () => {
  return (
    <div className="relative flex h-auto min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background-light text-slate-900">
      {/* Header Section */}
      <div className="sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <div className="text-primary flex size-10 shrink-0 items-center justify-center cursor-pointer">
            <Icon name="arrow_back" />
          </div>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 px-2">Loading Manifest</h2>
          <div className="text-primary flex size-10 shrink-0 items-center justify-center cursor-pointer bg-primary/10 rounded-full">
            <Icon name="camera_alt" />
          </div>
        </div>
        <div className="flex flex-col gap-3 p-4 pt-0">
          <div className="flex gap-6 justify-between items-end">
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">Job #4829</p>
              <p className="text-slate-900 text-base font-semibold">Residential Move - Downtown</p>
            </div>
            <p className="text-primary text-sm font-bold leading-normal">3 / 13 items</p>
          </div>
          <div className="rounded-full bg-primary/20 h-3 overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: '23%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <main className="flex-1 flex flex-col pb-24">
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <h3 className="text-slate-900 text-lg font-bold">Inventory Checklist</h3>
          <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600 font-medium">13 TOTAL</span>
        </div>
        
        {/* Item: Fridge */}
        <div className="flex items-center gap-4 border-b border-primary/5 px-4 min-h-[88px] py-3 justify-between hover:bg-primary/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex size-8 items-center justify-center">
              <input type="checkbox" className="h-6 w-6 rounded border-primary/40 border-2 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all cursor-pointer" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-slate-900 text-base font-bold leading-tight">Samsung Refrigerator</p>
              <p className="text-slate-500 text-sm leading-normal">Kitchen • Heavy • Double-door</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="text-slate-400 hover:text-primary flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
              <Icon name="mic" />
            </button>
            <button className="text-slate-400 hover:text-primary flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
              <Icon name="photo_camera" />
            </button>
          </div>
        </div>
        
        {/* Item: Sofa */}
        <div className="flex items-center gap-4 border-b border-primary/5 px-4 min-h-[88px] py-3 justify-between hover:bg-primary/5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex size-8 items-center justify-center">
              <input type="checkbox" className="h-6 w-6 rounded border-primary/40 border-2 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 focus:outline-none transition-all cursor-pointer" />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-slate-900 text-base font-bold leading-tight">Sectional Sofa (3-Seater)</p>
              <p className="text-slate-500 text-sm leading-normal">Living Room • Fragile • Fabric</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="text-slate-400 hover:text-primary flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
              <Icon name="mic" />
            </button>
            <button className="text-slate-400 hover:text-primary flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
              <Icon name="photo_camera" />
            </button>
          </div>
        </div>
      </main>
      
      {/* Floating Action Button for Capture Proof */}
      <div className="fixed bottom-24 right-6 flex flex-col items-end gap-3">
        <div className="bg-slate-900 text-white text-xs px-3 py-1 rounded-lg shadow-lg font-bold mb-[-8px]">
          CAPTURE PROOF
        </div>
        <button className="bg-primary text-white size-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
          <Icon name="photo_camera" className="!text-3xl" />
        </button>
      </div>
      
      {/* Sticky Summary Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-primary/20 p-4 pb-safe-action">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <p className="text-slate-500 text-xs">Currently loading</p>
            <p className="text-slate-900 font-bold">Van #TRK-202</p>
          </div>
          <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-base shadow-lg shadow-primary/30">
            Finish Loading
          </button>
        </div>
      </div>
    </div>
  );
};
