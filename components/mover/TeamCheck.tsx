import React from 'react';
import { Icon } from '../Icons';

export const TeamCheck: React.FC = () => {
  return (
    <div className="relative flex h-auto min-h-[100dvh] w-full flex-col overflow-x-hidden bg-background-light text-slate-900 font-display">
      {/* Top Navigation Bar */}
      <div className="flex items-center bg-background-light p-4 pb-2 justify-between border-b border-slate-200">
        <div className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 cursor-pointer">
          <Icon name="arrow_back" />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">Helper Team Check</h2>
      </div>
      
      {/* Section Title: Assigned Crew */}
      <div className="px-4 py-6">
        <h2 className="text-slate-900 text-2xl font-extrabold leading-tight tracking-tight">Assigned Crew</h2>
        <p className="text-slate-500 text-sm mt-1">Verify your team is present on site</p>
      </div>
      
      {/* Crew List Container */}
      <div className="px-4 space-y-3">
        {/* Crew Member 1 */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14 border-2 border-primary/20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5EBVZRenPUedJTahLiReCc0BGnbzrr7pXgjWFXz9RM14mvgOuA7__6ptwvSewZZpmR-r-Ne6tn7-8-3Glxx8mSY3oCO15lW7ABdk0ssqbJID5wXBh0iTiFKllicubKMj4lwsk29u-Al8kdZz4SplozOAHsl4xTvt7RFwvmrAAYDSgzvLZYgEigVL1SvLvVYNPMneffXVIG3QiufyyKv3XL-LRMhj5SxIe2apO9pD3y1wL6AVQMrb10vPHSiRNNppJ3JHlK79HJN7z')" }}></div>
            <div className="absolute bottom-0 right-0 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col flex-1 justify-center">
            <p className="text-slate-900 text-base font-bold leading-normal">John Smith</p>
            <p className="text-primary text-xs font-semibold uppercase tracking-wider leading-normal">Lead Mover</p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 text-primary">
              <Icon name="star" className="text-sm" />
              <span className="text-slate-900 text-sm font-bold">4.8</span>
            </div>
            <span className="text-slate-400 text-[10px] uppercase">124 jobs</span>
          </div>
        </div>
        
        {/* Crew Member 2 */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative">
            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-14 border-2 border-primary/20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDggG3sKRitXr5PF_V3RleC3bXKQ95ErVvil61eagZtRWI5rwAD4tyJ72x4XK6JOdaisv0tnZL4FySJ2o5e9Q66qUajZR_F57Ckgt1u-orOW-sPgpmEp18dzrgXarRlYVF2cRpPam0Kn2pG52dk_mk2C5P3udYeeWmlu_HcVggfeP8vCSZYe2_GA6AMeimKbKdHXXZCQNOjIg7IPCEhFwCRlytQ-MP14TGHqaFN-ZC5aaujB4gsQwntPNINzl_hoOHLYt83Ioj2NUP1')" }}></div>
            <div className="absolute bottom-0 right-0 bg-green-500 w-3.5 h-3.5 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col flex-1 justify-center">
            <p className="text-slate-900 text-base font-bold leading-normal">Mike Johnson</p>
            <p className="text-primary/70 text-xs font-semibold uppercase tracking-wider leading-normal">Helper</p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 text-primary">
              <Icon name="star" className="text-sm" />
              <span className="text-slate-900 text-sm font-bold">4.5</span>
            </div>
            <span className="text-slate-400 text-[10px] uppercase">82 jobs</span>
          </div>
        </div>
      </div>
      
      {/* Section Title: Checklist */}
      <div className="px-4 pb-3 pt-10">
        <h2 className="text-slate-900 text-2xl font-extrabold leading-tight tracking-tight">Arrival Checklist</h2>
        <p className="text-slate-500 text-sm mt-1">Complete these steps before starting the job</p>
      </div>
      
      {/* Checklist items */}
      <div className="px-4 space-y-4">
        <label className="flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer group">
          <div className="flex-1">
            <p className="text-slate-900 text-base font-bold">Helpers on-site</p>
            <p className="text-slate-500 text-xs">Verify both helpers are physically present</p>
          </div>
          <div className="relative flex items-center">
            <input type="checkbox" className="h-6 w-6 rounded border-slate-300 text-primary focus:ring-primary" defaultChecked />
          </div>
        </label>
        <label className="flex items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm cursor-pointer group">
          <div className="flex-1">
            <p className="text-slate-900 text-base font-bold">Equipment Ready</p>
            <p className="text-slate-500 text-xs">Straps, blankets, and dollies inspected</p>
          </div>
          <div className="relative flex items-center">
            <input type="checkbox" className="h-6 w-6 rounded border-slate-300 text-primary focus:ring-primary" />
          </div>
        </label>
      </div>
      
      {/* Floating Action Button / Start Loading */}
      <div className="mt-auto p-6 pb-safe-action">
        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <Icon name="play_arrow" />
          START LOADING
        </button>
        <p className="text-center text-slate-400 text-[10px] mt-4 uppercase tracking-widest font-semibold">Job ID: #MOV-88421</p>
      </div>
    </div>
  );
};
