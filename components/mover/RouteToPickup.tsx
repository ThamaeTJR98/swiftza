import React from 'react';
import { Icon } from '../Icons';

export const RouteToPickup: React.FC = () => {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-transparent text-slate-900 antialiased font-display">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
              <Icon name="arrow_back" />
            </div>
            <div>
              <h2 className="text-slate-900 text-lg font-bold leading-tight">Heading to Pickup</h2>
              <p className="text-slate-500 text-sm">Studio Apartment Move</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="emergency" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content (Interactive Map Area) */}
      <div className="relative flex-1 h-full">
        {/* MapViz is rendered globally, so we don't need it here if we make the background transparent */}
        
        {/* Map Floating Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
          <div className="flex flex-col rounded-xl bg-white shadow-xl border border-slate-200 overflow-hidden">
            <button className="flex size-12 items-center justify-center text-slate-600 hover:bg-slate-50 border-b border-slate-100">
              <Icon name="add" />
            </button>
            <button className="flex size-12 items-center justify-center text-slate-600 hover:bg-slate-50">
              <Icon name="remove" />
            </button>
          </div>
          <button className="flex size-12 items-center justify-center rounded-xl bg-white shadow-xl border border-slate-200 text-primary">
            <Icon name="near_me" />
          </button>
        </div>
        
        {/* Search Bar Overlay */}
        <div className="absolute top-28 left-4 right-4">
          <label className="flex flex-col w-full h-12 shadow-lg">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full bg-white border border-slate-200 overflow-hidden">
              <div className="text-slate-400 flex items-center justify-center pl-4">
                <Icon name="search" />
              </div>
              <input className="flex w-full border-none bg-transparent focus:ring-0 text-slate-900 placeholder:text-slate-400 text-base font-normal px-4" placeholder="Search for destination" />
            </div>
          </label>
        </div>
      </div>
      
      {/* Info & Actions Card (Bottom) */}
      <div className="relative bg-white p-4 rounded-t-3xl shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] border-t border-slate-200">
        <div className="flex flex-col gap-4">
          {/* Destination Info */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50">
            <div className="flex-1">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Current Pickup</p>
              <p className="text-slate-900 text-base font-bold">123 Maple Street, Suite 402</p>
              <p className="text-slate-500 text-sm">Downtown District</p>
            </div>
            <button className="flex items-center justify-center h-10 px-4 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
              <Icon name="map" className="mr-2" />
              <span className="text-sm font-bold">Maps</span>
            </button>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Icon name="distance" className="text-sm" />
                <span className="text-xs font-medium uppercase tracking-wide">Distance</span>
              </div>
              <p className="text-slate-900 text-2xl font-bold leading-tight">3.2 <span className="text-sm font-normal text-slate-500">miles</span></p>
            </div>
            <div className="flex flex-col gap-1 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Icon name="schedule" className="text-sm" />
                <span className="text-xs font-medium uppercase tracking-wide">ETA</span>
              </div>
              <p className="text-slate-900 text-2xl font-bold leading-tight">12 <span className="text-sm font-normal text-slate-500">mins</span></p>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="py-2">
            <button className="relative w-full h-16 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 overflow-hidden group shadow-lg shadow-primary/30">
              <div className="absolute left-2 top-2 bottom-2 aspect-square bg-white rounded-xl flex items-center justify-center text-primary">
                <Icon name="arrow_forward" />
              </div>
              <span className="ml-10 uppercase tracking-widest text-sm font-black">Slide to Arrive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
