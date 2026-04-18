import React, { useState } from 'react';
import { Icon } from '../../../../Icons';
import { RideRequest, RideStop } from '../../../../../types';

interface Props {
  ride: RideRequest;
  stops: RideStop[];
  currentStopIndex: number;
  onProceed: () => void;
}

export const StopVerification: React.FC<Props> = ({ ride, stops, currentStopIndex, onProceed }) => {
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const stopNumber = currentStopIndex + 1;
  const totalStops = stops.length;
  const progress = (stopNumber / totalStops) * 100;
  const currentStop = stops[currentStopIndex];

  return (
    <div className="font-sans bg-slate-50 text-slate-900 h-[100dvh] flex flex-col overflow-hidden animate-slide-up">
      {/* Header / Navigation Bar */}
      <header className="shrink-0 flex items-center bg-white p-4 border-b border-slate-200 justify-between">
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Stop {stopNumber} Verification</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-brand-orange/10 rounded-full">
          <Icon name="check_circle" className="text-brand-orange text-sm" />
          <span className="text-brand-orange text-[10px] font-bold uppercase tracking-wider">{stopNumber} of {totalStops}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Progress Section */}
        <div className="flex flex-col gap-3 p-4 bg-white border-b border-slate-200">
          <div className="flex justify-between items-center">
            <p className="text-slate-900 text-sm font-bold">Move Progress</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{Math.round(progress)}% Complete</p>
          </div>
          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-brand-orange rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Stop Details Card */}
        <div className="p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-brand-orange/10 p-2 rounded-lg shrink-0">
                <Icon name="location_on" className="text-brand-orange" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Location</p>
                <p className="text-sm text-slate-900 font-bold truncate">{currentStop?.address || 'Current Stop'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-brand-orange/10 p-2 rounded-lg shrink-0">
                <Icon name="inventory_2" className="text-brand-orange" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Stop Type</p>
                <p className="text-sm text-slate-900 font-bold">
                    {currentStop?.type === 'PICKUP' ? 'Pickup' : currentStop?.type === 'DROPOFF' ? 'Drop-off' : 'Intermediate'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Section */}
        <div className="px-4 py-2">
          <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight pb-2 uppercase tracking-widest text-[10px] text-slate-500">Proof of Arrival/Service</h2>
          
          {/* Photo Upload Area */}
          <div className="relative group" onClick={() => setPhotoUploaded(true)}>
            {photoUploaded ? (
              <div className="border border-brand-orange rounded-2xl aspect-video flex flex-col items-center justify-center bg-brand-orange/5 transition-all cursor-pointer relative overflow-hidden shadow-inner">
                <img src="https://picsum.photos/seed/stop/800/450" alt="Uploaded proof" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white size-12 rounded-full flex items-center justify-center shadow-xl">
                    <Icon name="check_circle" className="text-green-500 text-3xl" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl aspect-video flex flex-col items-center justify-center bg-white hover:border-brand-orange transition-all cursor-pointer group">
                <div className="bg-slate-100 size-12 rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <Icon name="add_a_photo" className="text-slate-400 group-hover:text-brand-orange text-2xl" />
                </div>
                <p className="text-slate-900 font-bold text-xs">Take Photo</p>
                <p className="text-slate-400 text-[10px] mt-1">Required to complete stop</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mx-4 mt-6 p-4 bg-brand-orange/5 rounded-xl border border-brand-orange/10">
            <div className="flex gap-3">
                <Icon name="info" className="text-brand-orange shrink-0" />
                <p className="text-slate-600 text-xs leading-relaxed">
                    {stopNumber < totalStops 
                        ? "Confirming this stop will update the move timeline and unlock navigation to the next location."
                        : "This is the final stop. Confirming will proceed to the unloading manifest."}
                </p>
            </div>
        </div>
      </main>

      {/* Action Button (Sticky Bottom) */}
      <footer className="shrink-0 p-4 pb-8 bg-white border-t border-slate-200">
        <button 
          onClick={onProceed}
          disabled={!photoUploaded}
          className={`w-full h-14 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${photoUploaded ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          <span>{stopNumber < totalStops ? 'Proceed to Next Stop' : 'Finish Sequence'}</span>
          {!photoUploaded && <Icon name="lock" className="text-sm" />}
        </button>
      </footer>
    </div>
  );
};
