import React from 'react';
import { Icon } from '../Icons';

export const ArrivedAtPickup: React.FC = () => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-transparent text-slate-900 antialiased font-display">
      <div className="flex items-center bg-white p-4 pb-2 justify-between border-b border-slate-200">
        <div className="text-slate-900 flex size-12 shrink-0 items-center justify-center cursor-pointer">
          <Icon name="arrow_back" />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Current Job</h2>
      </div>
      <div className="flex flex-col h-full">
        <div className="relative w-full aspect-[4/3] md:aspect-video">
          {/* MapViz is rendered globally */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-primary text-white p-2 rounded-full shadow-lg">
              <Icon name="location_on" className="!text-3xl" />
            </div>
          </div>
        </div>
        <div className="p-4 -mt-8 relative z-10">
          <div className="flex flex-col items-stretch justify-start rounded-xl shadow-xl bg-white border border-slate-100">
            <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-primary text-xs font-bold uppercase tracking-wider">Pickup Location</span>
              </div>
              <p className="text-slate-900 text-xl font-bold leading-tight tracking-[-0.015em]">Arrived at 742 Evergreen Terrace</p>
              <div className="flex items-center gap-2 mt-1">
                <Icon name="location_on" className="text-slate-500 text-sm" />
                <p className="text-slate-500 text-base font-normal leading-normal">Springfield, IL</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="flex justify-around bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                <Icon name="phone" className="text-primary" />
              </div>
              <p className="text-slate-700 text-sm font-semibold">Call Client</p>
            </div>
            <div className="w-px bg-slate-100 my-2"></div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                <Icon name="chat_bubble" className="text-primary" />
              </div>
              <p className="text-slate-700 text-sm font-semibold">Chat</p>
            </div>
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-3 px-4 py-6 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.05)] border-t border-slate-100">
          <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/30 transition-transform active:scale-[0.98]">
            <span className="truncate">I Have Arrived</span>
          </button>
          <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-slate-100 text-slate-900 text-base font-bold leading-normal tracking-[0.015em] border border-slate-200 transition-transform active:scale-[0.98]">
            <span className="truncate">Start Team Check</span>
          </button>
        </div>
      </div>
    </div>
  );
};
