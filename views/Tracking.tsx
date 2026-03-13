import React, { useEffect, useState } from 'react';
import { AppView, RideStatus, UserRole, ErrandCategory } from '../types';
import { Button } from '../components/Button';
import { BottomSheet } from '../components/BottomSheet';
import { useApp } from '../context/AppContext';
import { getSafetyTip } from '../utils/geminiService';
import { Icon } from '../components/Icons';
import { PanicButton } from '../components/PanicButton';
import { SafetyService } from '../services/SafetyService';
import { CommunicationService } from '../services/CommunicationService';
import { CreatorLiveQueueStatus } from '../components/request/CreatorLiveQueueStatus';
import { CreatorLiveMoveStatus } from '../components/request/CreatorLiveMoveStatus';

export const Tracking: React.FC = () => {
  // Added 'navigate' to the destructured properties from useApp()
  const { setView, navigate, activeRide, user, updateRideStatus, setActiveRide } = useApp();
  const [eta, setEta] = useState('4 min');
  const [showCancelOptions, setShowCancelOptions] = useState(false);
  const [showSafetyToolkit, setShowSafetyToolkit] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  const [isSharing, setIsSharing] = useState(false);
  const [safetyTip, setSafetyTip] = useState<string>('');

  const isDriver = user?.role === UserRole.DRIVER;

  useEffect(() => {
    if (!activeRide) return;
    
    if (activeRide.status === RideStatus.ARRIVED_PICKUP) setEta('Arrived');
    else if (activeRide.status === RideStatus.VERIFYING_RIDE) setEta('Handshake');
    else if (activeRide.status === RideStatus.IN_PROGRESS) setEta('12 min');
    else if (activeRide.status === RideStatus.ARRIVED_DROPOFF) setEta('Success');
    else setEta('4 min');

    if (activeRide.type === 'ride' && !isDriver) {
        getSafetyTip().then(setSafetyTip);
    }
  }, [activeRide?.status, activeRide?.type]);

  const handlePanic = () => {
      alert("PANIC ALERT SENT! Tracking team and emergency contacts notified.");
  };

  const handleShareTrip = () => {
      if (!activeRide) return;
      const link = SafetyService.getShareLink(
          activeRide.id, 
          user?.name || 'A SwiftZA User', 
          activeRide.dropoff.address.split(',')[0]
      );
      window.open(link, '_blank');
      setIsSharing(true);
  };

  const handleCancelRide = () => {
      if(!cancelReason) return;
      updateRideStatus(RideStatus.CANCELLED);
      setTimeout(() => setView(AppView.HOME), 1000);
  };

  if (!activeRide || !activeRide.driver) return null;

  const isQueueTask = activeRide.errandDetails?.category && [
      ErrandCategory.GOVT_QUEUE, 
      ErrandCategory.BANK_QUEUE, 
      ErrandCategory.FORM_SUBMISSION
  ].includes(activeRide.errandDetails.category as ErrandCategory);

  if (activeRide.type === 'errand' && isQueueTask) {
      return <CreatorLiveQueueStatus ride={activeRide} />;
  }

  if (activeRide.type === 'move' && !isDriver) {
      return <CreatorLiveMoveStatus ride={activeRide} />;
  }

  // --- SUB-VIEW: DRIVER ARRIVED ALERT ---
  const ArrivalAlert = () => (
      <div className="absolute top-20 left-4 right-4 z-[60] animate-slide-up">
          <div className="bg-white/95 backdrop-blur-xl border-2 border-brand-teal/30 p-5 rounded-2xl shadow-2xl flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-2">
                  <div className="bg-brand-teal/20 p-2 rounded-full animate-bounce">
                      <Icon name="celebration" className="text-brand-teal text-3xl" />
                  </div>
                  <h2 className="text-slate-900 text-2xl font-black tracking-tight leading-tight">
                      {activeRide.driver?.name} has Arrived!
                  </h2>
              </div>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">Your driver is at the pickup point</p>
          </div>
      </div>
  );

  return (
    <>
      {/* 1. Header Navigation Display */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 pt-safe-top pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-full flex items-center justify-between px-2 py-2 max-w-md mx-auto border border-white/20 pointer-events-auto">
              {/* Fix: navigate is now available in scope from useApp() */}
              <button onClick={() => navigate(AppView.HOME)} className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors">
                  <Icon name="keyboard_arrow_down" className="text-slate-700 text-2xl" />
              </button>
              <div className="flex-1 text-center">
                  <p className="text-[10px] font-black text-brand-teal uppercase tracking-[0.2em] mb-0.5">
                      {activeRide.status === RideStatus.IN_PROGRESS ? 'On Trip' : 'En Route'}
                  </p>
                  <h2 className="text-slate-900 text-sm font-black truncate max-w-[180px] mx-auto">
                      Heading to {activeRide.dropoff.address.split(',')[0]}
                  </h2>
              </div>
              <div className="size-10 flex items-center justify-center">
                  <div className="size-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
              </div>
          </div>
      </div>

      {/* 2. Driver Arrival Announcement */}
      {activeRide.status === RideStatus.ARRIVED_PICKUP && !isDriver && <ArrivalAlert />}

      {/* 3. Safety Action FAB */}
      {!isDriver && (
          <div className="fixed top-24 right-4 z-40 flex flex-col gap-2 pointer-events-auto">
             <PanicButton rideId={activeRide.id} mini />
          </div>
      )}

      {/* 4. Main Interaction Sheet */}
      <BottomSheet isOpen={true} onToggle={() => {}}>
        <div className="px-6 pb-28 pt-2">
            
            {showSafetyToolkit ? (
                 <div className="animate-slide-up space-y-4 pt-2">
                     <div className="flex items-center gap-3 mb-2">
                         <button onClick={() => setShowSafetyToolkit(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                             <Icon name="arrow_back" className="text-xl" />
                         </button>
                         <h3 className="font-black text-slate-900">Safety Toolkit</h3>
                     </div>
                     <div className={`p-4 rounded-2xl border flex justify-between items-center ${isSharing ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                         <div>
                             <p className="font-bold text-slate-900">Share Live Trip</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isSharing ? 'Sharing enabled' : 'Send to trusted contacts'}</p>
                         </div>
                         <button 
                            onClick={handleShareTrip}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isSharing ? 'bg-green-500 text-white' : 'bg-brand-teal text-slate-900'}`}
                         >
                             <Icon name="share" className="text-xl" />
                         </button>
                     </div>
                     <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3 text-center">Emergency SOS</p>
                        <PanicButton rideId={activeRide.id} className="flex justify-center" />
                     </div>
                 </div>
            ) : showCancelOptions ? (
                <div className="animate-slide-up space-y-4 pt-2">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Reason for cancellation?</p>
                    {['Driver not moving', 'Found another ride', 'Changed plans'].map(reason => (
                        <button key={reason} onClick={() => setCancelReason(reason)} className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-bold transition-all ${cancelReason === reason ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>{reason}</button>
                    ))}
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowCancelOptions(false)} className="flex-1 h-14 bg-slate-100 rounded-2xl font-black text-slate-500">Back</button>
                        <button onClick={handleCancelRide} disabled={!cancelReason} className="flex-[2] h-14 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-200 active:scale-95 transition-all">Cancel Ride</button>
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up">
                    
                    {/* Status Display */}
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-slate-900 text-3xl font-black tracking-tight leading-none">
                                {activeRide.status === RideStatus.ARRIVED_PICKUP ? 'Driver is here' : `Arriving in ${eta}`}
                            </h2>
                            <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-wider">
                                {activeRide.status === RideStatus.IN_PROGRESS ? 'Heading to Drop-off' : 'Heading to Pickup'}
                            </p>
                        </div>
                        {activeRide.status === RideStatus.IN_PROGRESS && (
                            <div className="bg-brand-teal/10 text-brand-teal px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">On Time</div>
                        )}
                    </div>

                    {/* QR HANDSHAKE CARD */}
                    {activeRide.status === RideStatus.ARRIVED_PICKUP && !isDriver && (
                        <div className="bg-slate-900 rounded-[2rem] p-6 mb-6 text-center shadow-2xl relative overflow-hidden border-4 border-slate-800">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-brand-teal shadow-[0_0_15px_rgba(0,196,180,1)]"></div>
                            <div className="w-20 h-20 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-teal/20">
                                <Icon name="qr_code_2" className="text-brand-teal text-4xl" />
                            </div>
                            <h3 className="text-white text-xl font-black mb-1">Verify Pickup</h3>
                            <p className="text-slate-400 text-xs mb-6">Show this code to {activeRide.driver?.name} to start your trip.</p>
                            
                            <div className="bg-white p-4 rounded-3xl inline-block shadow-inner relative group">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(JSON.stringify({ rideId: activeRide.id, otp: activeRide.otp || '2849' }))}`} 
                                    alt="QR" 
                                    className="size-40 object-contain mix-blend-multiply"
                                />
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-brand-teal text-slate-900 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                                    Code: {activeRide.otp || '2849'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Driver Profile Card */}
                    <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 group">
                        <div className="relative shrink-0">
                            <div className="size-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                <img src={`https://i.pravatar.cc/150?u= Michael`} alt="Driver" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 shadow-md border border-slate-100 flex items-center gap-1">
                                <span className="text-[10px] font-black text-slate-900">4.9</span>
                                <Icon name="star" className="text-[10px] text-brand-gold fill-current" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black text-slate-900 leading-tight truncate">{activeRide.driver.name}</h3>
                            <p className="text-slate-500 text-xs font-bold leading-tight mt-0.5 truncate">{activeRide.driver.vehicle}</p>
                            <div className="inline-flex mt-1.5 bg-brand-teal/10 text-brand-teal border border-brand-teal/20 px-2.5 py-1 rounded-lg text-xs font-black tracking-widest">
                                {activeRide.driver.plate}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setView(AppView.CHAT)} className="size-11 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm active:scale-90 transition-all">
                                <Icon name="chat_bubble" className="text-lg" />
                            </button>
                            <button onClick={() => CommunicationService.initiateCall(activeRide.driver?.phone || '', 'DRIVER')} className="size-11 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm active:scale-90 transition-all">
                                <Icon name="call" className="text-lg" />
                            </button>
                        </div>
                    </div>

                    {/* Safety Hint (AI Integrated) */}
                    {safetyTip && activeRide.status !== RideStatus.ARRIVED_PICKUP && (
                        <div className="bg-blue-600 text-white rounded-2xl p-4 shadow-xl flex items-start gap-4 mb-6 animate-slide-up">
                            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                <Icon name="shield" className="text-xl" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Safety First</p>
                                <p className="text-xs font-bold leading-relaxed">{safetyTip}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setShowSafetyToolkit(true)} className="h-14 rounded-2xl bg-white border-2 border-slate-100 font-black text-slate-600 text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                            <Icon name="shield" className="text-red-500" />
                            Safety Center
                        </button>
                        {activeRide.status !== RideStatus.IN_PROGRESS && (
                            <button onClick={() => setShowCancelOptions(true)} className="h-14 rounded-2xl bg-slate-50 font-black text-slate-400 text-sm uppercase tracking-widest hover:text-red-500 active:scale-[0.98] transition-all">
                                Cancel Ride
                            </button>
                        )}
                        {activeRide.status === RideStatus.IN_PROGRESS && (
                            <button onClick={() => setIsSharing(true)} className="h-14 rounded-2xl bg-slate-900 font-black text-white text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                                <Icon name="ios_share" />
                                Share Trip
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
      </BottomSheet>
    </>
  );
};
