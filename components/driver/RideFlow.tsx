import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { RideRequest, RideStatus } from '../../types';
import { Icon } from '../Icons';
import { useApp } from '../../context/AppContext';
import { PanicButton } from '../PanicButton';
import { CommunicationService } from '../../services/CommunicationService';

import { EscrowModal } from '../EscrowModal';

interface RideFlowProps {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

import { OtpKeypad } from '../OtpKeypad';

export const RideFlow: React.FC<RideFlowProps> = ({ ride, onStatusUpdate }) => {
  const { completeRide } = useApp();
  const [showManualInput, setShowManualInput] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showEscrow, setShowEscrow] = useState(false);

  // --- HANDLERS ---
  const handleScanSuccess = () => {
      onStatusUpdate(RideStatus.IN_PROGRESS);
  };

  const handleManualVerify = () => {
      setShowManualInput(false);
      onStatusUpdate(RideStatus.IN_PROGRESS);
  };

  const handleFinishTrip = async () => {
      setShowEscrow(true);
  };

  const confirmFinish = async () => {
      setIsFinishing(true);
      try {
          await completeRide();
      } catch (err) {
          alert("Error finalizing trip. Please check your connection.");
      } finally {
          setIsFinishing(false);
          setShowEscrow(false);
      }
  };

  // --- PHASE 1: ACCEPTED -> NAVIGATING TO PICKUP ---
  if (ride.status === RideStatus.ACCEPTED) {
      return (
          <div className="animate-slide-up space-y-4">
              <div className="flex justify-end mb-2">
                  <PanicButton rideId={ride.id} mini />
              </div>
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-4">
                          <div className="size-14 rounded-2xl overflow-hidden bg-brand-teal/10 shadow-inner">
                              <img src={`https://i.pravatar.cc/150?u=rider`} alt="Rider" className="w-full h-full object-cover" />
                          </div>
                          <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Passenger</p>
                              <h4 className="text-xl font-black text-slate-900 leading-none">Sarah</h4>
                              <div className="flex items-center gap-1 mt-1.5">
                                  <span className="material-symbols-rounded text-brand-gold text-sm fill-icon">star</span>
                                  <span className="text-slate-900 text-xs font-black">4.9</span>
                                  <span className="text-slate-400 text-[10px] font-bold uppercase ml-1">• Premium</span>
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button className="size-11 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:text-brand-teal transition-colors">
                              <Icon name="chat" className="text-xl" />
                          </button>
                          <button onClick={() => CommunicationService.initiateCall(ride.driver?.phone || '', 'RIDER')} className="size-11 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:text-green-500 transition-colors">
                              <Icon name="call" className="text-xl" />
                          </button>
                      </div>
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                      <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Estimated Fare</p>
                          <p className="text-base font-black text-slate-900">R {ride.price.toFixed(0)}</p>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Payment</p>
                          <p className="text-base font-black text-brand-teal">{ride.paymentMethod}</p>
                      </div>
                  </div>

                  <button 
                      onClick={() => onStatusUpdate(RideStatus.ARRIVED_PICKUP)}
                      className="w-full h-16 bg-brand-teal text-slate-900 font-black text-lg rounded-2xl shadow-xl shadow-brand-teal/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
                  >
                      <Icon name="check_circle" className="text-2xl" />
                      I Have Arrived
                  </button>
              </div>
          </div>
      );
  }

  // --- PHASE 2: AT PICKUP -> HANDSHAKE (Compact Takeover) ---
  if (ride.status === RideStatus.ARRIVED_PICKUP) {
      return createPortal(
          <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
              {showManualInput && (
                  <OtpKeypad 
                      correctOtp={ride.otp || '1234'} 
                      onVerify={handleManualVerify} 
                      onClose={() => setShowManualInput(false)} 
                      title="Passenger Verification"
                      subtitle="Enter Rider's 4-Digit PIN"
                  />
              )}
              
              {/* Immersive Scanner Background */}
              <div className="absolute inset-0 bg-slate-900">
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516055203705-367c4be3412b?auto=format&fit=crop&q=80&w=1000')" }}></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
              </div>

              {/* Header Overlay */}
              <div className="relative z-10 p-6 pt-safe-top flex items-center justify-between">
                 <button onClick={() => onStatusUpdate(RideStatus.ACCEPTED)} className="size-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white active:scale-90 transition-transform">
                     <Icon name="arrow_back" />
                 </button>
                 <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                     <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Secure Handshake</span>
                 </div>
                 <div className="size-12"></div>
              </div>

              <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
                  <div className="text-center mb-12">
                      <h2 className="text-white text-3xl font-black leading-tight mb-2">Verify Handshake</h2>
                      <p className="text-white/60 text-sm font-medium">Scan passenger QR or enter PIN</p>
                  </div>

                  {/* Immersive Scanner Frame */}
                  <div className="relative size-72">
                      <div className="absolute inset-0 border-2 border-white/20 rounded-[3rem]"></div>
                      
                      {/* Corner Brackets */}
                      <div className="absolute -top-2 -left-2 size-12 border-t-4 border-l-4 border-brand-teal rounded-tl-[2rem]"></div>
                      <div className="absolute -top-2 -right-2 size-12 border-t-4 border-r-4 border-brand-teal rounded-tr-[2rem]"></div>
                      <div className="absolute -bottom-2 -left-2 size-12 border-b-4 border-l-4 border-brand-teal rounded-bl-[2rem]"></div>
                      <div className="absolute -bottom-2 -right-2 size-12 border-b-4 border-r-4 border-brand-teal rounded-br-[2rem]"></div>
                      
                      {/* Scan Line Animation */}
                      <div className="absolute top-0 left-4 right-4 h-1 bg-brand-teal shadow-[0_0_20px_rgba(0,196,180,1)] z-20 animate-scan rounded-full"></div>
                      
                      {/* Scanner Content Simulation */}
                      <div className="absolute inset-8 border border-white/10 rounded-[2rem] flex items-center justify-center" onClick={handleScanSuccess}>
                          <Icon name="qr_code_2" className="text-white/20 text-8xl" />
                      </div>
                  </div>

                  <div className="mt-12 w-full max-w-xs space-y-4">
                      <button 
                          onClick={() => setShowManualInput(true)}
                          className="w-full h-16 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all"
                      >
                          <Icon name="key" className="text-xl" />
                          Manual PIN Entry
                      </button>
                      
                      <div className="flex items-center justify-center gap-2 text-white/40">
                          <Icon name="lock" className="text-[12px]" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Handshake Active</span>
                      </div>
                  </div>
              </div>

              <div className="relative z-10 p-6 pb-safe-action text-center">
                   <button onClick={handleScanSuccess} className="text-white/30 font-bold text-[9px] uppercase tracking-widest hover:text-brand-teal transition-colors">Simulation: Skip Verification</button>
              </div>
          </div>,
          document.body
      );
  }

  // --- PHASE 3: IN PROGRESS -> HEADING TO DROPOFF ---
  if (ride.status === RideStatus.IN_PROGRESS) {
      const stops = ride.stops || [];
      const currentStopIndex = ride.currentStopIndex || 0;
      const nextStop = stops[currentStopIndex] || ride.dropoff;
      const isLastStop = currentStopIndex >= stops.length;

      const handleNextStop = () => {
          if (isLastStop) {
              onStatusUpdate(RideStatus.ARRIVED_DROPOFF);
          } else {
              // In a real app, this would update the ride status to 'ARRIVED_STOP' or increment index
              // For now, we simulate arriving at the final dropoff if no stops logic is fully wired
              onStatusUpdate(RideStatus.ARRIVED_DROPOFF); 
          }
      };

      return (
          <div className="animate-slide-up space-y-4">
               <div className="bg-slate-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/10 rounded-full blur-3xl"></div>
                    
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="bg-brand-teal text-slate-900 size-12 rounded-xl flex items-center justify-center shadow-lg">
                            <Icon name={isLastStop ? "turn_right" : "alt_route"} className="text-2xl font-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                                {isLastStop ? 'Heading to Destination' : `Stop ${currentStopIndex + 1} of ${stops.length}`}
                             </p>
                             <h3 className="text-white text-lg font-black truncate leading-tight">{nextStop.address.split(',')[0]}</h3>
                        </div>
                        <div className="text-right">
                             <p className="text-brand-teal text-xl font-black leading-none">12 min</p>
                             <p className="text-slate-500 text-[10px] font-bold mt-1">3.4 km</p>
                        </div>
                    </div>

                    {/* Stop List Indicator */}
                    {stops.length > 0 && (
                        <div className="flex gap-1 mb-6 px-1">
                            {stops.map((_, idx) => (
                                <div key={idx} className={`h-1 flex-1 rounded-full ${idx < currentStopIndex ? 'bg-brand-teal' : idx === currentStopIndex ? 'bg-white animate-pulse' : 'bg-slate-800'}`} />
                            ))}
                            <div className={`h-1 flex-1 rounded-full ${isLastStop ? 'bg-white animate-pulse' : 'bg-slate-800'}`} />
                        </div>
                    )}

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between mb-6 relative z-10">
                         <div className="flex items-center gap-3">
                             <div className="size-10 rounded-full bg-slate-800 overflow-hidden">
                                 <img src={`https://i.pravatar.cc/100?u=rider`} alt="Rider" className="w-full h-full object-cover" />
                             </div>
                             <div>
                                 <p className="text-white text-sm font-bold">Thabo</p>
                                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Premium Rider</p>
                             </div>
                         </div>
                         <p className="text-brand-teal text-xl font-black tracking-tight">R {ride.price.toFixed(0)}</p>
                    </div>

                    <div className="relative w-full h-16 bg-white/10 rounded-full flex items-center p-1.5 overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">
                                {isLastStop ? 'Slide to End Trip' : 'Slide to Arrive at Stop'}
                            </p>
                        </div>
                        <button 
                            onClick={handleNextStop}
                            className="bg-white text-slate-900 size-13 aspect-square rounded-full flex items-center justify-center shadow-lg active:translate-x-[calc(100vw-120px)] transition-all duration-500 cursor-pointer group-hover:shadow-brand-teal/50"
                        >
                            <Icon name="keyboard_double_arrow_right" className="text-2xl font-black" />
                        </button>
                    </div>
               </div>

               <div className="flex gap-3">
                    <button onClick={() => window.open(`google.navigation:q=${nextStop.lat},${nextStop.lng}`)} className="flex-1 h-12 bg-white border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                         <Icon name="near_me" /> Open Maps
                    </button>
                    <PanicButton rideId={ride.id} />
               </div>
          </div>
      );
  }

  // --- PHASE 4: ARRIVED -> FINAL SETTLEMENT (PORTALED TAKEOVER) ---
  if (ride.status === RideStatus.ARRIVED_DROPOFF) {
      const commission = ride.price * 0.2;
      const netProfit = ride.price - commission;

      return createPortal(
          <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-y-auto">
              <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 flex items-center justify-between">
                  <div className="size-10"></div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase tracking-widest text-center">Trip Finalized</h1>
                  <div className="size-10"></div>
              </header>

              <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
                  <div className="text-center space-y-6">
                      <div className="relative inline-block">
                          <div className="size-32 rounded-full bg-emerald-50 flex items-center justify-center border-8 border-emerald-100/50 mb-4 mx-auto shadow-inner">
                              <Icon name="check_circle" className="text-emerald-500 text-6xl" />
                          </div>
                          <div className="absolute -top-2 -right-2 size-10 bg-brand-teal text-slate-900 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                              <Icon name="auto_awesome" className="text-lg" />
                          </div>
                      </div>
                      
                      <div className="space-y-2">
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Total Net Earning</p>
                          <h2 className="text-6xl font-black text-slate-900 tracking-tighter">R {netProfit.toFixed(0)}</h2>
                      </div>
                  </div>

                  <div className="w-full max-w-sm space-y-4 bg-slate-50 rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-slate-500">Gross Fare</span>
                          <span className="text-slate-900">R {ride.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-slate-500">Payment Mode</span>
                          <span className="text-brand-teal font-black text-[10px] uppercase bg-brand-teal/10 px-3 py-1 rounded-full">
                              {ride.paymentMethod}
                          </span>
                      </div>
                      <div className="h-px bg-slate-200 w-full my-4 border-dashed border-b" />
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                          <span className="uppercase tracking-widest">Platform (20%)</span>
                          <span>- R {commission.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4">
                          <span className="text-slate-900 font-black text-lg uppercase tracking-tight">Net Profit</span>
                          <span className="text-emerald-600 font-black text-4xl tracking-tighter">R {netProfit.toFixed(0)}</span>
                      </div>
                  </div>
                  
                  <div className="bg-brand-teal/10 px-6 py-3 rounded-full flex items-center gap-3 border border-brand-teal/20 shadow-sm">
                      <Icon name="account_balance_wallet" className="text-brand-teal" />
                      <p className="text-[10px] font-black text-brand-teal uppercase tracking-[0.15em]">Funds added to wallet</p>
                  </div>
              </main>

              <footer className="p-8 bg-white/80 backdrop-blur-md border-t border-slate-200 pb-safe-action">
                  <button 
                      disabled={isFinishing}
                      onClick={handleFinishTrip}
                      className="w-full h-18 bg-brand-teal text-slate-900 font-black text-base rounded-2xl shadow-2xl shadow-brand-teal/30 active:scale-[0.98] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                  >
                      {isFinishing ? (
                          <span className="material-symbols-rounded animate-spin">progress_activity</span>
                      ) : (
                          <>
                              Finish & Settle
                              <Icon name="check" className="text-xl" />
                          </>
                      )}
                  </button>
              </footer>
              
              {showEscrow && (
                  <EscrowModal 
                      amount={ride.price} 
                      recipientName="Driver" 
                      type="RELEASE"
                      onConfirm={confirmFinish}
                      onCancel={() => setShowEscrow(false)}
                  />
              )}
          </div>,
          document.body
      );
  }

  return null;
};