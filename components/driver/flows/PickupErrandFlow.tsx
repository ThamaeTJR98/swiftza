import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { RideRequest, RideStatus, RideStop } from '../../../types';
import { Icon } from '../../Icons';
import { useApp } from '../../../context/AppContext';
import { PanicButton } from '../../PanicButton';
import { EscrowModal } from '../../EscrowModal';
import { OtpKeypad } from '../../OtpKeypad';
import { IncidentalCostModal } from '../../IncidentalCostModal';
import { QRScannerModal } from '../../QRScannerModal';
import { RideService } from '../../../services/RideService';
import { CommunicationService } from '../../../services/CommunicationService';
import { supabase } from '../../../lib/supabase';

interface ErrandFlowProps {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

type PickupState = 'NAV_TO_STOP' | 'ARRIVED_AT_STOP' | 'PERFORM_ACTION' | 'CARD_ACTIVATION' | 'PAYMENT_SUCCESS' | 'HANDOVER' | 'SETTLEMENT';

export const PickupErrandFlow: React.FC<ErrandFlowProps> = ({ ride, onStatusUpdate }) => {
  const { completeRide } = useApp();
  const [localState, setLocalState] = useState<PickupState>('NAV_TO_STOP');
  const [showEscrow, setShowEscrow] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [reference, setReference] = useState('');
  const [navDistance, setNavDistance] = useState(400);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Incidental Payment State
  const [incidentalAmount, setIncidentalAmount] = useState('');
  const [cardTimer, setCardTimer] = useState(120);

  // Multi-Stop Logic
  const currentStopIndex = ride.currentStopIndex || 0;
  const stops: RideStop[] = ride.stops && ride.stops.length > 0 
    ? ride.stops 
    : [
        { id: 'pickup', type: 'PICKUP', address: ride.pickup.address, lat: ride.pickup.lat, lng: ride.pickup.lng, status: 'PENDING' },
        { id: 'dropoff', type: 'DROPOFF', address: ride.dropoff.address, lat: ride.dropoff.lat, lng: ride.dropoff.lng, status: 'PENDING' }
      ];
  const currentStop: RideStop | undefined = stops[currentStopIndex];
  const isLastStop = currentStopIndex >= stops.length - 1;

  const isCompanionRide = ride.errandDetails?.category === 'ELDERLY_SUPPORT' || ride.errandDetails?.category === 'SCHOOL_RUN';
  const [isRecording, setIsRecording] = useState(false);

  // Sync internal state with RideStatus
  useEffect(() => {
    if (ride.status === RideStatus.ACCEPTED || ride.status === RideStatus.IN_PROGRESS) {
        setLocalState('NAV_TO_STOP');
    }
    if (ride.status === RideStatus.ARRIVED_PICKUP || ride.status === RideStatus.ARRIVED_DROPOFF) {
        setLocalState('ARRIVED_AT_STOP');
    }
    if (ride.status === RideStatus.SHOPPING) {
        // If we were paying, stay in paying flow
        if (localState !== 'CARD_ACTIVATION' && localState !== 'PAYMENT_SUCCESS') {
            setLocalState('PERFORM_ACTION');
        }
    }
    // If we are at the final dropoff and status is ARRIVED_DROPOFF, we might want to trigger handover
    if (ride.status === RideStatus.ARRIVED_DROPOFF && isLastStop) {
        setLocalState('HANDOVER');
    }
  }, [ride.status, currentStopIndex, isLastStop]);

  // Navigation simulation effect
  useEffect(() => {
    let interval: any;
    if (localState === 'NAV_TO_STOP') {
        interval = setInterval(() => {
            setNavDistance(prev => (prev > 10 ? prev - 15 : 0));
        }, 3000);
    }
    return () => clearInterval(interval);
  }, [localState]);

  // Card Timer Effect
  useEffect(() => {
      let interval: any;
      if (localState === 'CARD_ACTIVATION') {
          interval = setInterval(() => {
              setCardTimer(prev => {
                  if (prev <= 1) {
                      clearInterval(interval);
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [localState]);

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopArrival = () => {
    if (currentStop?.type === 'PICKUP') {
        onStatusUpdate(RideStatus.ARRIVED_PICKUP);
    } else {
        onStatusUpdate(RideStatus.ARRIVED_DROPOFF);
    }
  };

  const handleActionComplete = () => {
      // If there are more stops, we go back to IN_PROGRESS and increment index (handled by parent/backend usually, but here we simulate)
      if (!isLastStop) {
          // In a real app, we'd call an API to complete the stop. 
          // Here we simulate the update by calling onStatusUpdate with data indicating the stop is done.
          // For this simulation, we'll assume the parent updates the index or we just set status to IN_PROGRESS
          onStatusUpdate(RideStatus.IN_PROGRESS, { stopCompleted: true, stopId: currentStop?.id });
          setReceiptPhoto(null); // Reset for next stop
      } else {
          // Final stop
          setLocalState('HANDOVER');
      }
  };

  const handleIncidentalRequest = async (amount: number, reason: string) => {
      setShowCostModal(false);
      try {
          // Call Backend to Authorize Funds
          await RideService.requestIncidentalFunds(ride.id, amount, reason);
          
          setIncidentalAmount(amount.toFixed(2));
          setLocalState('CARD_ACTIVATION');
          setCardTimer(120);
      } catch (error) {
          alert("Fund authorization failed. Please try again.");
      }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              if (ev.target?.result) {
                  setReceiptPhoto(ev.target!.result as string);
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleScan = (data: string) => {
      setShowScanner(false);
      if (data) {
          try {
              const parsed = JSON.parse(data);
              if (parsed.rideId === ride.id && parsed.otp === (ride.otp || '2849')) {
                  setLocalState('SETTLEMENT');
              } else {
                  alert("Invalid QR Code: This code belongs to a different trip.");
              }
          } catch (e) {
              // Fallback for legacy plain-text OTP QR codes
              if (data === (ride.otp || '2849')) {
                  setLocalState('SETTLEMENT');
              } else {
                  alert("Invalid QR Code format.");
              }
          }
      }
  };

  if (!currentStop) return null;

  // --- VIEW 1: NAVIGATING TO STOP ---
  if (localState === 'NAV_TO_STOP') {
    return (
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background-light animate-slide-up">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4">
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <Icon name="navigation" className="text-primary" />
                    </div>
                    <div>
                        <h2 className="text-slate-900 text-sm font-bold leading-tight">En route to {currentStop.type.toLowerCase()}</h2>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Heading to: {currentStop.address.split(',')[0]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <PanicButton rideId={ride.id} mini />
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <Icon name="more_vert" />
                    </button>
                </div>
            </div>
        </header>

        {/* Main Map Area */}
        <main className="relative flex-1">
            <div className="h-full w-full bg-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC79gG88aXYy5mncnhUOHXOsVqUPeQo3vwEdQmQFmbhM1Id7oTUygWSaw7HNKy2NAnZSadMjBKFG92xCm0i4WT9vi-fGBp4onopXX-zleJ2JeZimrRqLNJL_Aad-evxPm6OsZAveISzwY-M2lfiIldCRqFiHclV_tJUMyfajFixRy8iXBykPwH4tsamskxNQilFD8D2q4wOlqXjFNb3p7YGSY577IxEgsPfq0YIkKQQj6Ig-pkOuQzkA7-A-2fXhEuPKWagvlP5fWwS')" }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-background-light/40 to-transparent pointer-events-none"></div>
                </div>
                
                {/* Floating Map Controls */}
                <div className="absolute right-4 bottom-48 flex flex-col gap-3">
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xl border border-slate-200">
                        <Icon name="add" className="text-slate-700" />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-xl border border-slate-200">
                        <Icon name="remove" className="text-slate-700" />
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-xl">
                        <Icon name="my_location" />
                    </button>
                </div>
            </div>

            {/* Ride Details Drawer (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe-action">
                <div className="bg-white p-5 rounded-2xl shadow-2xl border border-slate-100">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex flex-col gap-1">
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full w-fit uppercase">Stop {currentStopIndex + 1} of {stops.length}</span>
                            <h3 className="text-slate-900 text-lg font-bold">{navDistance}m • {Math.ceil(navDistance / 50)} mins</h3>
                            <p className="text-slate-500 text-sm">{currentStop.type === 'PICKUP' ? 'Collect items for' : 'Deliver items to'} {currentStop.customerName || 'Client'}</p>
                        </div>
                        <button 
                            onClick={handleStopArrival}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
                        >
                            <Icon name="check_circle" className="text-sm" />
                            <span>Arrived</span>
                        </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <p className="text-slate-700 text-sm font-semibold">Distance to {currentStop.type}</p>
                            <p className="text-primary text-sm font-bold">{Math.max(0, Math.min(100, Math.round((1 - navDistance/400) * 100)))}%</p>
                        </div>
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, Math.min(100, Math.round((1 - navDistance/400) * 100)))}%` }}></div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-3 rounded-xl border border-slate-200 font-semibold">
                            <Icon name="chat" className="text-[20px]" />
                            <span>Message</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 py-3 rounded-xl border border-slate-200 font-semibold">
                            <Icon name="call" className="text-[20px]" />
                            <span>Call</span>
                        </button>
                    </div>
                </div>
            </div>
        </main>
      </div>
    );
  }

  // --- VIEW 2: ARRIVED AT STOP ---
  if (localState === 'ARRIVED_AT_STOP') {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 bg-slate-200">
            <div className="absolute inset-0 bg-cover bg-center opacity-60 grayscale" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC79gG88aXYy5mncnhUOHXOsVqUPeQo3vwEdQmQFmbhM1Id7oTUygWSaw7HNKy2NAnZSadMjBKFG92xCm0i4WT9vi-fGBp4onopXX-zleJ2JeZimrRqLNJL_Aad-evxPm6OsZAveISzwY-M2lfiIldCRqFiHclV_tJUMyfajFixRy8iXBykPwH4tsamskxNQilFD8D2q4wOlqXjFNb3p7YGSY577IxEgsPfq0YIkKQQj6Ig-pkOuQzkA7-A-2fXhEuPKWagvlP5fWwS')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent"></div>
        </div>

        {/* Header Overlay */}
        <div className="relative z-10 p-6 pt-safe-top flex items-center justify-between">
           <button onClick={() => setLocalState('NAV_TO_STOP')} className="size-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-slate-200"><Icon name="arrow_back" /></button>
           <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-slate-200">
               <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">At {currentStop.type}</h2>
           </div>
           <div className="size-10"></div>
        </div>
        
        {/* Bottom Confirmation Sheet */}
        <div className="mt-auto relative z-10 p-4 pb-12 animate-slide-up">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center">
                <div className="size-20 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl relative mx-auto mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <Icon name="location_on" className="text-4xl" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-2">You've Arrived!</h1>
                <p className="text-slate-500 text-sm font-medium mb-10">
                    {currentStop.type === 'PICKUP' 
                        ? `Confirm arrival to collect items for ${currentStop.customerName || 'Client'}.`
                        : `Confirm arrival to deliver items to ${currentStop.customerName || 'Client'}.`
                    }
                </p>
                
                {isCompanionRide && currentStop.type === 'PICKUP' && (
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-6 w-full text-left">
                        <div className="flex items-center gap-2 mb-2">
                            <Icon name="badge" className="text-amber-600" />
                            <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest">Identity Check Required</h3>
                        </div>
                        <p className="text-[10px] text-amber-700 leading-relaxed">
                            This is a Companion Ride. Please show your profile photo and name to the passenger for verification before they enter the vehicle.
                        </p>
                    </div>
                )}

                <div className="w-full space-y-3">
                    <button 
                        onClick={() => setLocalState('PERFORM_ACTION')}
                        className="w-full bg-primary text-white py-5 rounded-full text-lg font-black shadow-xl shadow-primary/20 active:scale-95 transition-all uppercase tracking-widest"
                    >
                        START {currentStop.type}
                    </button>
                </div>
            </div>
        </div>
      </div>,
      document.body
    );
  }

  // --- VIEW 3: PERFORM ACTION (PICKUP OR DROPOFF) ---
  if (localState === 'PERFORM_ACTION') {
    const isPickup = currentStop.type === 'PICKUP';

    return (
      <div className="fixed inset-0 z-[9999] bg-black flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        {/* Camera Viewport Area */}
        <div className="flex-1 relative overflow-hidden">
            <div 
                className="w-full h-full bg-cover bg-center transition-transform duration-700 scale-110" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0waKnPQ48NMv2N67Z4_ZJtPzfGwEXONKpBx02I1RESWd_Yiecho7M4nD-K20b8Ye2D_qq1XHYMHxMyxidpuSedetJIYLzcykTBzidX7j6Fkx49vZGM5-VlvBXvTQskuzHdCaVND6pwUrFuEkKOuX5e52GPbIChg7TkG72Uvr5ycLbQW6rHjQ3siFEHLPw9Rq6DGjNqi4RABY8Ukqy5_7PNKSu26OyiZknrNbdC1JPWT5pDKhxDhhtZx9aMqXcKsNDMUhrM4_6gGX7')" }}
            >
                {/* Viewfinder Brackets */}
                <div className="absolute inset-16 border-2 border-white/20 rounded-[2rem] pointer-events-none">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
                
                {/* Top Controls */}
                <div className="absolute top-safe-top left-0 right-0 p-6 flex items-center justify-between">
                    <button onClick={() => setLocalState('ARRIVED_AT_STOP')} className="size-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white">
                        <Icon name="close" />
                    </button>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        <span className="text-white text-[10px] font-black uppercase tracking-widest">Verify {isPickup ? 'Pickup' : 'Drop-off'}</span>
                    </div>
                    <button className="size-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white">
                        <Icon name="flash_on" />
                    </button>
                </div>

                {/* Camera UI Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="size-48 border border-white/10 rounded-full flex items-center justify-center">
                        <div className="size-32 border border-white/20 rounded-full flex items-center justify-center">
                            <div className="size-16 border border-white/30 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Bottom Camera Controls */}
                <div className="absolute bottom-12 left-0 right-0 flex items-center justify-center gap-12 px-8">
                    <button className="flex shrink-0 items-center justify-center rounded-2xl size-14 bg-white/10 backdrop-blur-md text-white border border-white/20">
                        <Icon name="image" className="text-2xl" />
                    </button>
                    <button 
                        onClick={handleActionComplete}
                        className="flex shrink-0 items-center justify-center rounded-full size-24 bg-white/20 backdrop-blur-lg border-4 border-white p-1.5 active:scale-90 transition-transform"
                    >
                        <div className="size-full bg-white rounded-full shadow-inner"></div>
                    </button>
                    <button className="flex shrink-0 items-center justify-center rounded-2xl size-14 bg-white/10 backdrop-blur-md text-white border border-white/20">
                        <Icon name="flip_camera_ios" className="text-2xl" />
                    </button>
                </div>

                {/* Location Tag */}
                <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/10">
                    <div className="size-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>GPS: {currentStop.address.split(',')[0]}</span>
                </div>
            </div>
        </div>

        {/* Package Details Drawer (Overlay) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-20">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border border-white/20">
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-slate-900 text-2xl font-black leading-tight mb-1">Package {isPickup ? 'Pickup' : 'Drop-off'}</h3>
                        <p className="text-slate-500 text-sm font-medium">Take a clear photo of the items at the location.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Reference / Order Number</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="e.g. ZA-7742-JHB"
                                    className="w-full h-14 rounded-2xl border-slate-200 bg-slate-50 px-5 pr-14 text-slate-900 font-bold focus:border-primary focus:ring-primary outline-none transition-all" 
                                />
                                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-primary size-10 flex items-center justify-center hover:bg-primary/10 rounded-xl transition-colors">
                                    <Icon name="barcode_scanner" />
                                </button>
                            </div>
                        </div>

                        <button 
                            onClick={handleActionComplete}
                            className="w-full h-16 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            <Icon name="check_circle" className="text-xl" />
                            Confirm & Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- VIEW 4: CARD ACTIVATION (JIT FUNDING) ---
  if (localState === 'CARD_ACTIVATION') {
      const handleSimulateTap = () => {
          setLocalState('PAYMENT_SUCCESS');
      };

      return createPortal(
          <div className="fixed inset-0 z-[9999] bg-emerald-600 flex flex-col font-sans h-[100dvh] w-full animate-fade-in text-white">
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="size-32 rounded-full border-4 border-white/20 flex items-center justify-center mb-8 relative">
                      <div className="absolute inset-0 border-4 border-white rounded-full animate-ping opacity-20"></div>
                      <span className="text-5xl font-black tabular-nums">{formatTime(cardTimer)}</span>
                  </div>
                  
                  <h1 className="text-3xl font-black mb-2">Card Active</h1>
                  <p className="text-emerald-100 font-medium text-lg mb-8">Limit: R{incidentalAmount}</p>
                  
                  <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-md border border-white/20 w-full max-w-xs">
                      <Icon name="contactless" className="text-6xl mb-4 mx-auto" />
                      <p className="text-sm font-bold uppercase tracking-widest">Tap Phone on Terminal</p>
                  </div>

                  <button 
                      onClick={handleSimulateTap}
                      className="mt-12 bg-white text-emerald-600 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                  >
                      Simulate Tap
                  </button>
                  
                  <button 
                      onClick={() => setLocalState('PERFORM_ACTION')}
                      className="mt-4 text-white/60 text-xs font-bold uppercase tracking-widest"
                  >
                      Cancel
                  </button>
              </div>
          </div>,
          document.body
      );
  }

  // --- VIEW 5: PAYMENT SUCCESS ---
  if (localState === 'PAYMENT_SUCCESS') {
      return createPortal(
          <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans h-[100dvh] w-full animate-fade-in">
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="size-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                      <Icon name="check_circle" className="text-5xl" />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Successful</h1>
                  <p className="text-slate-500 text-sm font-medium mb-8">R{incidentalAmount} Paid via Virtual Card</p>

                  <button 
                      onClick={() => setLocalState('PERFORM_ACTION')}
                      className="w-full max-w-xs h-16 bg-slate-900 text-white rounded-3xl font-black text-base shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                      Continue Job
                      <Icon name="arrow_forward" />
                  </button>
              </div>
          </div>,
          document.body
      );
  }

  // --- VIEW 6: FINAL HANDOVER (Only for the very last stop) ---
  if (localState === 'HANDOVER') {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        {/* Immersive Scanner Background */}
        <div className="absolute inset-0 bg-slate-900">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMns-bskE0BFlibNmSKHv0AkscTzJvlezRghrxOKOqrNAbvMRYudjDKhlpZzZ5d6v-khoX26xsvOf82S6nhITYVdPDA6-GqkSrlj7OsaVgk1B8xdGuo1r-d2Ol9pR47EmnBU82DUO7yCRRIvN4oqt-6FvugoyCa1fiQj2PUPIYricp46ivHaFuJoQblxWqoj6OzPKwr4whD55oSlEbtynkj5lwTXUakTIWLxAkl9bCfnAojtyWH0KSVtMuYdRG_qCKXyxQ4meejGls')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        </div>

        {/* Header Overlay */}
        <div className="relative z-10 p-6 pt-safe-top flex items-center justify-between">
           <button onClick={() => onStatusUpdate(RideStatus.IN_PROGRESS)} className="size-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white active:scale-90 transition-transform">
               <Icon name="arrow_back" />
           </button>
           <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
               <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Secure Handover</span>
           </div>
           <button className="size-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white">
               <Icon name="help_outline" />
           </button>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
            <div className="text-center mb-12">
                <h2 className="text-white text-3xl font-black leading-tight mb-2">Scan Handover QR</h2>
                <p className="text-white/60 text-sm font-medium">Position the customer's QR code in the frame</p>
            </div>

            {/* Immersive Scanner Frame */}
            <div className="relative size-72">
                <div className="absolute inset-0 border-2 border-white/20 rounded-[3rem]"></div>
                
                {/* Corner Brackets */}
                <div className="absolute -top-2 -left-2 size-12 border-t-4 border-l-4 border-primary rounded-tl-[2rem]"></div>
                <div className="absolute -top-2 -right-2 size-12 border-t-4 border-r-4 border-primary rounded-tr-[2rem]"></div>
                <div className="absolute -bottom-2 -left-2 size-12 border-b-4 border-l-4 border-primary rounded-bl-[2rem]"></div>
                <div className="absolute -bottom-2 -right-2 size-12 border-b-4 border-r-4 border-primary rounded-br-[2rem]"></div>
                
                {/* Scan Line Animation */}
                <div className="absolute top-0 left-4 right-4 h-1 bg-primary shadow-[0_0_20px_rgba(20,184,166,1)] z-20 animate-scan rounded-full"></div>
                
                {/* Scanner Content Simulation */}
                <div className="absolute inset-8 border border-white/10 rounded-[2rem] flex items-center justify-center">
                    <Icon name="qr_code_2" className="text-white/20 text-8xl" />
                </div>
            </div>

            <div className="mt-12 flex items-center gap-8">
                <button className="size-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                    <Icon name="image" className="text-2xl" />
                </button>
                <button 
                    onClick={() => setShowScanner(true)}
                    className="size-24 flex items-center justify-center rounded-full bg-primary text-white shadow-2xl shadow-primary/40 active:scale-95 transition-all"
                >
                    <Icon name="qr_code_scanner" className="!text-4xl" />
                </button>
                <button className="size-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
                    <Icon name="flashlight_on" className="text-2xl" />
                </button>
            </div>
        </div>

        {/* Bottom Sheet Details */}
        <div className="relative z-10 p-4 pb-12 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <Icon name="inventory_2" className="text-primary text-2xl" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Delivery Order</p>
                            <h3 className="text-slate-900 text-xl font-black leading-none">#{ride.id.substring(0, 8)}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-emerald-500 text-xl font-black leading-none">R {ride.price.toFixed(2)}</p>
                        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">Total Value</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setShowOtp(true)}
                        className="h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Icon name="key" />
                        Enter PIN
                    </button>
                    <button 
                        onClick={() => CommunicationService.initiateCall(ride.driver?.phone || '', 'RIDER')}
                        className="h-16 bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Icon name="call" />
                        Call Client
                    </button>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                    <Icon name="lock" className="text-[12px]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Encrypted Handshake Protocol</span>
                </div>
            </div>
        </div>

        <QRScannerModal 
            isOpen={showScanner}
            onClose={() => setShowScanner(false)}
            onScan={handleScan}
            title="Scan Handover QR"
        />
        
        {showOtp && (
            <OtpKeypad 
                correctOtp={ride.otp || '1234'} 
                onVerify={() => { setShowOtp(false); setLocalState('SETTLEMENT'); }} 
                onClose={() => setShowOtp(false)} 
                title="Client Verification"
                subtitle="Enter Client's 4-Digit PIN"
            />
        )}
      </div>,
      document.body
    );
  }

  // --- VIEW 7: SETTLEMENT ---
  if (localState === 'SETTLEMENT') {
    return (
      <div className="relative flex min-h-[100dvh] w-full flex-col max-w-md mx-auto shadow-xl bg-background-light animate-slide-up">
        {/* Header */}
        <div className="flex items-center p-4 justify-between border-b border-primary/10">
            <div onClick={() => completeRide()} className="text-primary flex size-10 shrink-0 items-center justify-center cursor-pointer">
                <Icon name="arrow_back" />
            </div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Job Summary</h2>
            <div className="flex w-10 items-center justify-end">
                <button className="flex items-center justify-center text-primary">
                    <Icon name="share" />
                </button>
            </div>
        </div>

        {/* Success Banner */}
        <div className="px-4 pt-6 pb-2 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Icon name="check_circle" className="text-primary text-4xl" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Job Completed</h1>
            <p className="text-slate-500 text-sm mt-1">Order #{ride.id.substring(0, 8)} • {new Date().toLocaleDateString()}</p>
        </div>

        {/* Earnings Overview */}
        <div className="p-4">
            <div className="flex flex-col gap-2 rounded-xl p-6 bg-primary text-white shadow-lg shadow-primary/20">
                <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Net Payout</p>
                <p className="text-4xl font-bold">R {ride.price.toFixed(2)}</p>
                <div className="mt-2 pt-2 border-t border-white/20 flex justify-between items-center text-xs font-medium">
                    <span>Total Service Value</span>
                    <span>R {(ride.price * 1.1).toFixed(2)}</span>
                </div>
            </div>
        </div>

        {/* Breakdown Section */}
        <div className="px-4 py-2">
            <h3 className="text-slate-900 text-sm font-bold uppercase tracking-widest mb-4">Service Breakdown</h3>
            
            {stops.map((stop, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon name={stop.type === 'PICKUP' ? "inventory_2" : "local_shipping"} className="text-sm" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-bold">Stop {idx + 1}: {stop.address.split(',')[0]}</p>
                                <p className="text-slate-500 text-xs">Completed</p>
                            </div>
                        </div>
                        <p className="text-slate-900 font-bold">R {(ride.price / stops.length).toFixed(2)}</p>
                    </div>
                </div>
            ))}

            {/* Fees and Surcharges */}
            <div className="px-2 py-4 space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Booking Surcharges</span>
                    <span className="text-slate-900 font-medium">R 10.00</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Platform Commission (10%)</span>
                    <span className="text-red-500 font-medium">- R {(ride.price * 0.1).toFixed(2)}</span>
                </div>
            </div>
        </div>

        {/* Secure Release QR Section */}
        <div className="mx-4 my-6 p-6 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center">
            <h4 className="text-slate-900 font-bold mb-1">Release Payment</h4>
            <p className="text-slate-500 text-xs text-center mb-4">Scan QR code to securely release funds to provider</p>
            <div className="bg-white p-3 rounded-lg shadow-sm">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHpooMJw0gSLjmH_keJhveyICB26j-dg26Eis5t9y3JYwryMySLL0spzOsQToSVZ9xQdUWk3PqFkm81ccW8Bfid0-86rmky89zRGTgkXW2-F8oyxvTxyUoHNwAuXH_5s6Ps9coJoCuY0UvR4Hh_F2fn65Si1nKm8R3Rxs08npUjIX_rekky59AH2lnF6Md7YktNkGBmVba6IuexvSjrDJL9NIpPa0dXtIbF13mFzxdVzt59dYLHpasb1O-llSg8MTQRpU0sS4P09LQ" alt="QR Code" className="w-32 h-32" />
            </div>
            <button 
                onClick={() => completeRide()}
                className="mt-6 w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
                <Icon name="check_circle" />
                Finish Job
            </button>
        </div>

        <div className="h-24"></div>
      </div>
    );
  }

  return null;
};
