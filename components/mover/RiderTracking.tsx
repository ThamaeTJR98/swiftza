import React from 'react';
import { Icon } from '../Icons';

export const RiderTracking: React.FC = () => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-transparent text-slate-900 antialiased font-display">
      <header className="flex items-center bg-background-light p-4 border-b border-primary/10 sticky top-0 z-50">
        <div className="text-primary flex size-10 shrink-0 items-center justify-center cursor-pointer">
          <Icon name="arrow_back" />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 ml-2">Move Fulfillment Tracking</h2>
        <div className="text-slate-600 flex size-10 shrink-0 items-center justify-center">
          <Icon name="more_vert" />
        </div>
      </header>
      
      <main className="flex-1 overflow-hidden relative bg-slate-200">
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <Icon name="map" className="text-6xl opacity-20" />
        </div>
        
        {/* Map Floating Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          <div className="flex flex-col gap-1 bg-white p-1 rounded-xl shadow-md border border-slate-200">
            <button className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100">
              <Icon name="add" className="text-slate-700" />
            </button>
            <div className="h-px bg-slate-200 mx-2"></div>
            <button className="flex size-10 items-center justify-center rounded-lg hover:bg-slate-100">
              <Icon name="remove" className="text-slate-700" />
            </button>
          </div>
          <button className="flex size-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
            <Icon name="near_me" />
          </button>
        </div>
      </main>
      
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
          <div className="flex flex-col gap-1 flex-[2_2_0px]">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary"></span>
              <p className="text-primary text-xs font-bold uppercase tracking-wider">Live Status</p>
            </div>
            <p className="text-slate-900 text-base font-bold leading-tight">Mover is Unloading your items</p>
            <p className="text-slate-500 text-sm font-normal">Estimated completion: 15 mins</p>
          </div>
          <div className="relative w-24 bg-center bg-no-repeat aspect-video bg-cover rounded-lg overflow-hidden border border-slate-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAC0Dq1U4jdF6OyPrlTBFy5Ybmu5CxU9Eugm9WtZP6_gjVPCV-yWOQz1Jcujm3Z3ZQxnmdDiGOf7Q6aiW1kMu2n0JHGH4qpPakuLFOjAvQhNDcj5gAJGbU3MsQgfS3I2gNLZCvoWOCdTfoyI63CZz8B8nfZzGKbnzmIt7IH5xmcTsteB90wG33t48KlymrqnpVwRyz6hOZdvmwQ-KTWbHLkSvEUjwn9d5Gu1v965woWRk6UihAMVK9TRy9C2SJQ4stk9D4DWU2QzJaL')" }}>
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
              <Icon name="photo_camera" className="text-white/80" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
