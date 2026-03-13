import React from 'react';
import { Icon } from '../Icons';

export const RouteToDestination: React.FC = () => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-transparent text-slate-900 antialiased font-display">
      {/* TopAppBar */}
      <div className="flex items-center bg-white p-4 pb-2 justify-between border-b border-primary/10 z-10">
        <div className="text-primary flex size-12 shrink-0 items-center cursor-pointer">
          <Icon name="arrow_back" />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">Navigation to Drop-off</h2>
      </div>
      
      {/* Main Content (Map Area) */}
      <div className="flex-1 overflow-hidden relative">
        {/* MapViz is rendered globally */}
        
        {/* Map UI Elements */}
        <div className="absolute top-20 left-4 right-4 z-10">
          <label className="flex flex-col min-w-40 h-12 shadow-lg rounded-xl overflow-hidden">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white border border-slate-200">
              <div className="text-primary flex border-none items-center justify-center pl-4">
                <Icon name="search" />
              </div>
              <input className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-slate-900 focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-slate-400 px-4 pl-2 text-base font-normal" placeholder="Search along route" />
            </div>
          </label>
          
          {/* Map Controls */}
          <div className="absolute right-0 top-16 flex flex-col items-end gap-3">
            <div className="flex flex-col shadow-lg rounded-xl overflow-hidden bg-white border border-slate-200">
              <button className="flex size-12 items-center justify-center border-b border-slate-100 text-slate-700">
                <Icon name="add" />
              </button>
              <button className="flex size-12 items-center justify-center text-slate-700">
                <Icon name="remove" />
              </button>
            </div>
            <button className="flex size-12 items-center justify-center rounded-xl bg-white shadow-lg text-primary border border-slate-200">
              <Icon name="navigation" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating Status Section */}
      <div className="px-4 -mt-10 relative z-20 shrink-0">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-xl border border-primary/10">
          <div className="flex flex-col gap-1 flex-[2_2_0px]">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-teal-500"></span>
              <p className="text-slate-900 text-base font-bold leading-tight">Goods Secured & In Transit</p>
            </div>
            <p className="text-slate-500 text-sm font-normal leading-normal">Professional handling in progress</p>
          </div>
          <div className="h-16 w-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Icon name="local_shipping" className="!text-4xl" />
          </div>
        </div>
      </div>
      
      {/* Destination Info */}
      <div className="p-4 shrink-0">
        <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-col gap-1">
            <p className="text-primary text-xs font-bold uppercase tracking-wider">Destination</p>
            <p className="text-slate-900 text-base font-bold leading-tight">123 Maple Avenue, Springfield</p>
            <div className="flex items-center gap-2 mt-1">
              <Icon name="schedule" className="text-sm text-slate-500" />
              <p className="text-slate-600 text-sm font-medium">ETA: 14:45 <span className="text-teal-600">(25 mins)</span></p>
            </div>
          </div>
          <button className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-background-light border border-primary/30 text-primary text-sm font-bold shadow-sm">
            <span className="truncate">View Details</span>
          </button>
        </div>
      </div>
      
      {/* Footer Confirm Action */}
      <div className="flex px-4 py-6 bg-background-light border-t border-primary/10 shrink-0">
        <div className="relative flex w-full h-16 items-center bg-slate-100 rounded-full p-2">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-slate-400 text-sm font-semibold uppercase tracking-widest">Slide to Confirm Arrival</span>
          </div>
          <button className="z-10 flex size-12 items-center justify-center rounded-full bg-primary text-white shadow-lg cursor-grab active:cursor-grabbing">
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>
    </div>
  );
};
