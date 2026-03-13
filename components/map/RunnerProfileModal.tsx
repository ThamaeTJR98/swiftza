
import React from 'react';
import { RunnerLocation, AppView } from '../../types';
import { Icon } from '../Icons';
import { useApp } from '../../context/AppContext';

interface RunnerProfileModalProps {
  runner: RunnerLocation;
  onClose: () => void;
}

export const RunnerProfileModal: React.FC<RunnerProfileModalProps> = ({ runner, onClose }) => {
  const { navigate, setInitialRequestQuery } = useApp();

  const handleRequest = () => {
    // In a real app, we might pass the runner ID to the request flow
    navigate(AppView.REQUEST_RIDE);
    onClose();
  };

  return (
    <div 
      className="fixed inset-x-0 z-[60] p-4 animate-slide-up pointer-events-auto"
      style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
    >
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden max-w-md mx-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                <img 
                  src={`https://i.pravatar.cc/150?u=${runner.driver_id}`} 
                  alt="Runner" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">{runner.name || 'SwiftZA Runner'}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Icon name="star" className="text-amber-400 text-xs" />
                  <span className="text-xs font-bold text-slate-600">{runner.rating || '5.0'}</span>
                  <span className="text-slate-300 mx-1">•</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{runner.mode || 'Motorbike'}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 active:scale-90 transition-all"
            >
              <Icon name="close" className="text-lg" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Response Time</p>
              <p className="text-xs font-bold text-slate-900">~4 mins</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Completed</p>
              <p className="text-xs font-bold text-slate-900">1.2k+ Errands</p>
            </div>
          </div>

          <button 
            onClick={handleRequest}
            className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Request this Runner</span>
            <Icon name="arrow_forward" className="text-brand-teal text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};
