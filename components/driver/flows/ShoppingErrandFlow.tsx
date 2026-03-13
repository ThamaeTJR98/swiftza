import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RideRequest, RideStatus, ErrandItem, RideStop, ErrandCategory } from '../../../types';
import { Icon } from '../../Icons';
import { useApp } from '../../../context/AppContext';
import { supabase } from '../../../lib/supabase';
import { PanicButton } from '../../PanicButton';
import { EscrowModal } from '../../EscrowModal';
import { OtpKeypad } from '../../OtpKeypad';
import { QRScannerModal } from '../../QRScannerModal';
import { RideService } from '../../../services/RideService';
import { RunnerArrivedAtStore } from './modules/shopping/RunnerArrivedAtStore';
import { RunnerShoppingChecklist } from './modules/shopping/RunnerShoppingChecklist';
import { RunnerSubstituteModal } from './modules/shopping/RunnerSubstituteModal';

interface ErrandFlowProps {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

type ShoppingState = 'NAV_TO_STOP' | 'ARRIVED_AT_STOP' | 'SHOPPING' | 'QUEUEING' | 'SUBSTITUTING' | 'CHECKOUT' | 'CARD_ACTIVATION' | 'PAYMENT_SUCCESS' | 'HANDOVER' | 'SETTLEMENT';

export const ShoppingErrandFlow: React.FC<ErrandFlowProps> = ({ ride, onStatusUpdate }) => {
  const { completeRide } = useApp();
  
  // Multi-Stop Logic
  const currentStopIndex = ride.currentStopIndex || 0;
  const stops: RideStop[] = ride.stops && ride.stops.length > 0 
    ? ride.stops 
    : [
        { id: 'pickup', type: 'SHOPPING', address: ride.pickup.address, lat: ride.pickup.lat, lng: ride.pickup.lng, status: 'PENDING' },
        { id: 'dropoff', type: 'DROPOFF', address: ride.dropoff.address, lat: ride.dropoff.lat, lng: ride.dropoff.lng, status: 'PENDING' }
      ];
  const currentStop: RideStop | undefined = stops[currentStopIndex];
  const isLastStop = currentStopIndex >= stops.length - 1;

  // Filter items for the current stop if they are assigned, otherwise fallback to all items (legacy)
  const initialItems = currentStop?.items || ride.errandDetails?.items || [];
  const [items, setItems] = useState<ErrandItem[]>(JSON.parse(JSON.stringify(initialItems)));
  
  const [localState, setLocalState] = useState<ShoppingState>('NAV_TO_STOP');
  const [showEscrow, setShowEscrow] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // Form States
  const [actualCost, setActualCost] = useState('');
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [isSubstituting, setIsSubstituting] = useState<ErrandItem | null>(null);
  
  // Queue States
  const [queueStartTime, setQueueStartTime] = useState<number | null>(null);
  const [queueElapsed, setQueueElapsed] = useState(0);
  const [queueFee, setQueueFee] = useState(0);

  // Card States
  const [cardTimer, setCardTimer] = useState(120); // 2 minutes
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  
  // Interactive Navigation Simulation
  const [navDistance, setNavDistance] = useState(400);

  // Sync internal state with RideStatus
  useEffect(() => {
    // Reset items when stop changes
    const newItems = currentStop?.items || ride.errandDetails?.items || [];
    setItems(JSON.parse(JSON.stringify(newItems)));

    if (ride.status === RideStatus.ACCEPTED || ride.status === RideStatus.IN_PROGRESS) {
        setLocalState('NAV_TO_STOP');
    }
    if (ride.status === RideStatus.ARRIVED_PICKUP || ride.status === RideStatus.ARRIVED_DROPOFF) {
        setLocalState('ARRIVED_AT_STOP');
    }
    if (ride.status === RideStatus.SHOPPING) {
        // If we were queueing, stay in queueing, otherwise shopping
        if (localState !== 'QUEUEING') {
            setLocalState('SHOPPING');
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

  // Queue Timer Effect
  useEffect(() => {
    let interval: any;
    if (localState === 'QUEUEING') {
        interval = setInterval(() => {
            setQueueElapsed(prev => {
                const newElapsed = prev + 1;
                // Calculate Fee: First 10 mins free, then R2.50/min (simulated)
                const billableMinutes = Math.max(0, Math.floor(newElapsed / 60) - 10);
                setQueueFee(billableMinutes * 2.50);
                return newElapsed;
            });
        }, 1000); // Speed up for demo? No, keep real-time for now or maybe faster for demo
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

  const updateItem = (id: string, updates: Partial<ErrandItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleSuggestSub = (item: ErrandItem) => {
    setIsSubstituting(item);
    setLocalState('SUBSTITUTING');
  };

  const handleStopArrival = () => {
    if (currentStop?.type === 'SHOPPING' || currentStop?.type === 'PICKUP') {
        onStatusUpdate(RideStatus.ARRIVED_PICKUP);
    } else {
        onStatusUpdate(RideStatus.ARRIVED_DROPOFF);
    }
  };

  const startQueue = () => {
      setLocalState('QUEUEING');
      setQueueStartTime(Date.now());
  };

  const endQueue = () => {
      // Transition to checkout
      setLocalState('CHECKOUT');
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentStop) return null;

  // --- VIEW 1: NAVIGATING TO STORE ---
  if (localState === 'NAV_TO_STOP') {
    return (
      <div className="animate-slide-up space-y-4">
          <div className="flex justify-between items-start mb-4">
              <div>
                  <h2 className="text-slate-900 text-xl font-black leading-tight tracking-tight">Store Location</h2>
                  <div className="flex items-center gap-2 mt-1">
                      <Icon name="schedule" className="text-sm text-primary" />
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Est. 15 mins drive</p>
                  </div>
              </div>
              <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                  <span className="text-primary font-black text-[10px] uppercase tracking-widest">Stop {currentStopIndex + 1} of {stops.length}</span>
              </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                      <Icon name="storefront" className="text-xl" />
                  </div>
                  <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-0.5">Destination</p>
                      <p className="text-slate-900 font-bold text-sm">{currentStop.address.split(',')[0]}</p>
                  </div>
              </div>
              <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-0.5">Distance</p>
                  <p className="text-slate-900 font-black text-lg">{navDistance}m</p>
              </div>
          </div>

          <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-700 active:scale-95 transition-all">
                  <Icon name="chat" className="text-lg" />
                  <span>Chat</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-700 active:scale-95 transition-all">
                  <Icon name="call" className="text-lg" />
                  <span>Call</span>
              </button>
          </div>

          <button 
              onClick={handleStopArrival}
              className="w-full h-16 bg-brand-teal text-slate-900 font-black text-lg rounded-2xl shadow-xl shadow-brand-teal/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-wider mt-4"
          >
              <Icon name="check_circle" className="text-2xl" />
              I Have Arrived
          </button>
      </div>
    );
  }

  // --- VIEW 2: ARRIVED AT STORE TAKEOVER ---
  if (localState === 'ARRIVED_AT_STOP') {
    return createPortal(
      <RunnerArrivedAtStore
        currentStop={currentStop}
        items={items}
        onStartShopping={() => setLocalState('SHOPPING')}
        onBack={() => setLocalState('NAV_TO_STOP')}
      />,
      document.body
    );
  }

  // --- VIEW 3: QUEUEING STATE ---
  if (localState === 'QUEUEING') {
      return createPortal(
        <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
            <div className="flex items-center p-4 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200">
                <div onClick={() => setLocalState('SHOPPING')} className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                    <Icon name="arrow_back" className="text-slate-700" />
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-slate-900">Errand in Progress</h2>
            </div>
            
            <div className="flex-1 px-4 py-6 flex flex-col">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        Waiting in Queue
                    </div>
                </div>

                <div className="flex flex-col items-center mb-10">
                    <div className="flex gap-4 w-full">
                        <div className="flex grow basis-0 flex-col items-center gap-2">
                            <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
                                <p className="text-3xl font-bold text-slate-900">
                                    {Math.floor(queueElapsed / 3600).toString().padStart(2, '0')}
                                </p>
                            </div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Hours</p>
                        </div>
                        <div className="flex items-center pt-2">
                            <span className="text-3xl font-bold text-slate-400">:</span>
                        </div>
                        <div className="flex grow basis-0 flex-col items-center gap-2">
                            <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
                                <p className="text-3xl font-bold text-primary">
                                    {Math.floor((queueElapsed % 3600) / 60).toString().padStart(2, '0')}
                                </p>
                            </div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Minutes</p>
                        </div>
                        <div className="flex items-center pt-2">
                            <span className="text-3xl font-bold text-slate-400">:</span>
                        </div>
                        <div className="flex grow basis-0 flex-col items-center gap-2">
                            <div className="flex h-20 w-full items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200">
                                <p className="text-3xl font-bold text-slate-900">
                                    {(queueElapsed % 60).toString().padStart(2, '0')}
                                </p>
                            </div>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Seconds</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex flex-col gap-2 rounded-2xl p-5 bg-white shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium">Queue Rate</p>
                        <p className="text-slate-900 text-xl font-bold">R2.50 <span className="text-sm font-normal text-slate-500">/ min</span></p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl p-5 bg-white shadow-sm border border-slate-200">
                        <p className="text-slate-500 text-sm font-medium">Wait Fee</p>
                        <p className="text-primary text-xl font-bold">R{queueFee.toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <Icon name="verified" className="text-sm" />
                        <p className="text-sm font-semibold">GPS Verified at Check-out</p>
                    </div>
                </div>

                <div className="mt-auto mb-6 bg-slate-100 rounded-2xl overflow-hidden relative h-32 border border-slate-200">
                    <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-2 rounded-lg shadow-md flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Icon name="shopping_basket" className="text-white text-lg" />
                            </div>
                            <div className="pr-2">
                                <p className="text-xs font-bold leading-none text-slate-900">{currentStop.address.split(',')[0]}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Current Location</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 pb-safe-action">
                <button 
                    onClick={endQueue}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                    <Icon name="payments" />
                    Finish Queue & Pay
                </button>
                <p className="text-center text-slate-400 text-xs mt-3">
                    Wait fee will stop once you proceed to payment
                </p>
            </div>
        </div>,
        document.body
      );
  }

  // --- VIEW 4: ACTIVE SHOPPING CHECKLIST ---
  if (localState === 'SHOPPING') {
    return createPortal(
      <RunnerShoppingChecklist
        items={items}
        onUpdateItem={updateItem}
        onSubstitute={handleSuggestSub}
        onStartQueue={startQueue}
        onCheckout={() => setLocalState('CHECKOUT')}
        onMessages={() => {}}
        onBack={() => onStatusUpdate(RideStatus.IN_PROGRESS)}
        onMenu={() => {}}
      />,
      document.body
    );
  }

  // --- VIEW 4.5: SUBSTITUTING ITEM ---
  if (localState === 'SUBSTITUTING' && isSubstituting) {
      return createPortal(
          <RunnerSubstituteModal
              item={isSubstituting}
              onConfirm={(name, price) => {
                  setItems(prev => prev.map(item => 
                      item.id === isSubstituting.id 
                          ? { ...item, status: 'SUBSTITUTED', name: `${item.name} (Sub: ${name})`, estimatedPrice: price } 
                          : item
                  ));
                  setLocalState('SHOPPING');
                  setIsSubstituting(null);
              }}
              onCancel={() => {
                  setLocalState('SHOPPING');
                  setIsSubstituting(null);
              }}
          />,
          document.body
      );
  }

  // --- VIEW 5: CHECKOUT & JIT FUNDING ---
  if (localState === 'CHECKOUT') {
    const handleAuthorize = async () => {
        const cost = parseFloat(actualCost);
        const estimated = ride.errandDetails?.estimatedGoodsCost || 0;
        
        // If actual cost is > 20% higher than estimated, require auth
        if (cost > estimated * 1.2) {
            setAuthRequired(true);
            return;
        }

        // Proceed to Card Activation via Edge Function
        setIsAuthorizing(true);
        try {
            // Call the new Edge Function to provision the card
            const { data, error } = await supabase.functions.invoke('provision-card', {
                body: { 
                    rideId: ride.id, 
                    estimatedTotal: cost 
                }
            });

            if (error) throw error;

            // Success! Move to card activation
            setLocalState('CARD_ACTIVATION');
            setCardTimer(120); // Reset timer
        } catch (err: any) {
            console.error("JIT Funding Error:", err);
            alert(`Failed to authorize funds: ${err.message || 'Unknown error'}`);
        } finally {
            setIsAuthorizing(false);
        }
    };

    const requestAuth = () => {
        setIsAuthorizing(true);
        // Simulate API call to client
        setTimeout(() => {
            setIsAuthorizing(false);
            setAuthRequired(false);
            alert("Client Authorized Additional Amount!");
            handleAuthorize();
        }, 2000);
    };

    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        {/* Auth Modal */}
        {authRequired && (
            <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 text-center shadow-2xl animate-scale-up border border-slate-200">
                    <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="payments" className="text-primary text-3xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Budget Increase Required</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        The total amount is higher than the original estimate. Please request approval from the customer.
                    </p>
                    
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Original</p>
                            <p className="text-lg font-bold text-slate-900">R{ride.errandDetails?.estimatedGoodsCost?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="flex-1 bg-primary/5 rounded-xl p-3 border border-primary/20">
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">New Total</p>
                            <p className="text-lg font-bold text-slate-900">R{parseFloat(actualCost).toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={requestAuth}
                            disabled={isAuthorizing}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isAuthorizing ? (
                                <>
                                    <Icon name="sync" className="animate-spin" />
                                    Requesting...
                                </>
                            ) : (
                                'Request Approval'
                            )}
                        </button>
                        <button onClick={() => setAuthRequired(false)} className="w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all">
                            Edit Total
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex items-center p-4 pb-2 justify-between bg-background-light border-b border-slate-200">
            <div onClick={() => setLocalState('SHOPPING')} className="text-slate-900 flex size-12 shrink-0 items-center justify-center cursor-pointer rounded-full hover:bg-slate-100 transition-colors">
                <Icon name="arrow_back" />
            </div>
            <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Errand Payment</h2>
        </div>

        <div className="flex-1 flex flex-col">
            <div className="flex flex-col gap-3 p-4">
                <div className="flex gap-6 justify-between">
                    <p className="text-slate-600 text-sm font-medium leading-normal">Step 3: Finalize Payment</p>
                    <p className="text-primary text-sm font-bold leading-normal">ZAR {actualCost || '0.00'}</p>
                </div>
                <div className="rounded-full bg-primary/20 h-2">
                    <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: actualCost ? '100%' : '50%' }}></div>
                </div>
            </div>

            <div className="px-4 py-5 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="receipt_long" className="text-primary text-3xl" />
                </div>
                <h3 className="text-slate-900 tracking-tight text-2xl font-bold leading-tight">Total Spent</h3>
                <p className="text-slate-500 text-sm mt-2 px-6">Enter the exact amount from your store receipt to authorize the virtual card.</p>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="flex items-center justify-center w-full">
                        <span className="text-4xl font-bold text-slate-400 mr-2">R</span>
                        <input 
                            type="number" 
                            value={actualCost} 
                            onChange={e => setActualCost(e.target.value)}
                            placeholder="0.00"
                            className="text-6xl font-black text-slate-900 w-full max-w-[200px] text-center outline-none bg-transparent placeholder:text-slate-200"
                            autoFocus
                        />
                    </div>
                    <div className="w-full h-px bg-slate-200 mt-4"></div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Estimated: R{ride.errandDetails?.estimatedGoodsCost?.toFixed(2) || '0.00'}</p>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
                <button 
                    disabled={!actualCost || isAuthorizing}
                    onClick={handleAuthorize}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                    {isAuthorizing ? 'Authorizing...' : 'Authorize Virtual Card'}
                    <Icon name="credit_card" />
                </button>
            </div>
        </div>
      </div>,
      document.body
    );
  }

  // --- VIEW 6: CARD ACTIVATION (JIT FUNDING) ---
  if (localState === 'CARD_ACTIVATION') {
      const handleSimulateTap = () => {
          setLocalState('PAYMENT_SUCCESS');
      };

      return createPortal(
        <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
            <div className="flex items-center p-4 pb-2 justify-between bg-background-light border-b border-slate-200">
                <div onClick={() => setLocalState('CHECKOUT')} className="text-slate-900 flex size-12 shrink-0 items-center justify-center cursor-pointer rounded-full hover:bg-slate-100 transition-colors">
                    <Icon name="arrow_back" />
                </div>
                <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Pay at Till</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-sm relative mb-12">
                    {/* Simulated Card */}
                    <div className="w-full aspect-[1.586/1] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden transform transition-transform hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <Icon name="contactless" className="text-3xl" />
                            <span className="font-bold tracking-widest text-sm opacity-80">SwiftZA Fleet</span>
                        </div>
                        <div className="mt-8 relative z-10">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Authorized Limit</p>
                            <p className="text-3xl font-bold">R {parseFloat(actualCost).toFixed(2)}</p>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
                            <p className="font-mono tracking-widest opacity-80">•••• •••• •••• 4242</p>
                            <Icon name="credit_card" className="text-2xl opacity-50" />
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-4 max-w-xs mx-auto">
                    <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping"></div>
                        <Icon name="tap_and_play" className="text-primary text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Ready to Pay</h2>
                    <p className="text-slate-500 text-sm">
                        Hold your phone near the card reader to complete the payment.
                    </p>
                    
                    <div className="mt-8 bg-slate-100 rounded-xl p-4 inline-block">
                        <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-2">
                            <Icon name="timer" className="text-primary" />
                            Expires in: <span className="text-primary font-mono text-lg">{Math.floor(cardTimer / 60)}:{(cardTimer % 60).toString().padStart(2, '0')}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
                <button 
                    onClick={handleSimulateTap}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    Simulate Payment Success
                    <Icon name="check_circle" />
                </button>
            </div>
        </div>,
        document.body
      );
  }

  // --- VIEW 7: PAYMENT SUCCESS & RECEIPT ---
  if (localState === 'PAYMENT_SUCCESS') {
      const handleFinishStop = () => {
          const cost = parseFloat(actualCost);
          
          // If not last stop, we move to next stop (IN_PROGRESS)
          if (!isLastStop) {
              onStatusUpdate(RideStatus.IN_PROGRESS, { 
                  stopCompleted: true, 
                  stopId: currentStop.id,
                  errandDetails: { ...ride.errandDetails, actualGoodsCost: cost, receiptUrl: receiptPhoto, queueFee } 
              });
              setActualCost('');
              setReceiptPhoto(null);
              setQueueFee(0);
          } else {
               onStatusUpdate(RideStatus.ARRIVED_DROPOFF, { 
                  errandDetails: { ...ride.errandDetails, actualGoodsCost: cost, receiptUrl: receiptPhoto, queueFee } 
              });
          }
      };

      return createPortal(
        <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="size-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 animate-scale-up">
                    <Icon name="check_circle" className="text-5xl" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful</h1>
                <p className="text-slate-500 text-sm font-medium mb-8">Transaction ID: #TXN-{Math.floor(Math.random() * 10000)}</p>

                <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 text-left">
                    <h3 className="text-slate-900 font-bold mb-4">Transaction Details</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Store</span>
                            <span className="text-slate-900 text-sm font-medium">{currentStop.address.split(',')[0]}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Total Paid</span>
                            <span className="text-slate-900 text-sm font-bold">R {parseFloat(actualCost).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div 
                  onClick={() => setReceiptPhoto('mock_photo')}
                  className={`w-full max-w-sm rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                      receiptPhoto 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100'                  }`}
                >
                  <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${
                      receiptPhoto 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                      : 'bg-white text-slate-400 shadow-sm'
                  }`}>
                      <Icon name={receiptPhoto ? "check" : "add_a_photo"} className="text-2xl" />
                  </div>
                  <div className="text-center">
                      <p className="text-sm font-bold">{receiptPhoto ? 'Receipt Captured' : 'Upload Till Slip'}</p>
                      {!receiptPhoto && <p className="text-xs mt-1 opacity-80">Required before proceeding</p>}
                  </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
                <button 
                    disabled={!receiptPhoto}
                    onClick={handleFinishStop}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                    {isLastStop ? 'Proceed to Delivery' : 'Next Stop'}
                    <Icon name="arrow_forward" />
                </button>
            </div>
        </div>,
        document.body
      );
  }

  // --- VIEW 8: HANDOVER HANDSHAKE ---
  if (localState === 'HANDOVER') {
    const handleScan = (data: string) => {
        setShowScanner(false);
        if (data) {
            try {
                const parsed = JSON.parse(data);
                if (parsed.rideId === ride.id && parsed.otp === (ride.otp || '2849')) {
                    setShowEscrow(true);
                } else {
                    alert("Invalid QR Code: This code belongs to a different trip.");
                }
            } catch (e) {
                if (data === (ride.otp || '2849')) {
                    setShowEscrow(true);
                } else {
                    alert("Invalid QR Code format.");
                }
            }
        }
    };

    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        {/* Immersive Scanner Background */}
        <div className="absolute inset-0 bg-slate-900">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMns-bskE0BFlibNmSKHv0AkscTzJvlezRghrxOKOqrNAbvMRYudjDKhlpZzZ5d6v-khoX26xsvOf82S6nhITYVdPDA6-GqkSrlj7OsaVgk1B8xdGuo1r-d2Ol9pR47EmnBU82DUO7yCRRIvN4oqt-6FvugoyCa1fiQj2PUPIYricp46ivHaFuJoQblxWqoj6OzPKwr4whD55oSlEbtynkj5lwTXUakTIWLxAkl9bCfnAojtyWH0KSVtMuYdRG_qCKXyxQ4meejGls')" }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        </div>

        {/* Header Overlay */}
        <div className="relative z-10 p-6 pt-safe-top flex items-center justify-between">
           <button onClick={() => onStatusUpdate(RideStatus.IN_PROGRESS)} className="size-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white active:scale-90 transition-transform">
               <Icon name="arrow_back" />
           </button>
           <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
               <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Secure Handover</span>
           </div>
           <button className="size-12 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white">
               <Icon name="help_outline" />
           </button>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
            <div className="text-center mb-12">
                <h2 className="text-white text-3xl font-black leading-tight mb-2">Scan Customer QR</h2>
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
                <button className="size-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white active:scale-95 transition-all">
                    <Icon name="image" className="text-2xl" />
                </button>
                <button 
                    onClick={() => setShowScanner(true)}
                    className="size-24 flex items-center justify-center rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/40 active:scale-95 transition-all"
                >
                    <Icon name="qr_code_scanner" className="!text-4xl" />
                </button>
                <button className="size-14 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white active:scale-95 transition-all">
                    <Icon name="flashlight_on" className="text-2xl" />
                </button>
            </div>
        </div>

        {/* Bottom Sheet Details */}
        <div className="relative z-10 p-4 pb-12 animate-slide-up">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center shadow-inner">
                            <Icon name="local_shipping" className="text-primary text-2xl" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Shopping Job</p>
                            <h3 className="text-slate-900 text-xl font-black leading-none">#{ride.id.substring(0, 8)}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-emerald-500 text-xl font-black leading-none">R {ride.price.toFixed(2)}</p>
                        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">Total Quote</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setShowOtp(true)}
                        className="h-16 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Icon name="key" className="text-lg" />
                        Enter PIN
                    </button>
                    <button 
                        onClick={() => alert("Calling Client...")}
                        className="h-16 bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Icon name="call" className="text-lg" />
                        Call Client
                    </button>
                </div>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                    <Icon name="lock" className="text-[12px]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Secure Handover Protocol</span>
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
                onVerify={() => { setShowOtp(false); setShowEscrow(true); }} 
                onClose={() => setShowOtp(false)} 
                title="Client Verification"
                subtitle="Enter Client's 4-Digit PIN"
            />
        )}

        {showEscrow && (
            <EscrowModal 
                amount={ride.price} 
                recipientName="Driver" 
                type="RELEASE"
                onConfirm={() => {
                    setShowEscrow(false);
                    setLocalState('SETTLEMENT');
                }} 
                onCancel={() => setShowEscrow(false)}
            />
        )}
      </div>,
      document.body
    );
  }

  // --- VIEW 9: SETTLEMENT ---
  if (localState === 'SETTLEMENT') {
    const commission = ride.price * 0.1;
    const netProfit = ride.price - commission;

    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 flex items-center justify-between">
            <div className="size-10"></div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase tracking-widest">Job Finalized</h1>
            <div className="size-10"></div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-12">
            <div className="text-center space-y-6">
                <div className="relative inline-block">
                    <div className="size-32 rounded-full bg-emerald-50 flex items-center justify-center border-8 border-emerald-100/50 mb-4 mx-auto shadow-inner">
                        <Icon name="check_circle" className="text-emerald-500 text-6xl" />
                    </div>
                    <div className="absolute -top-2 -right-2 size-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl">
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
                    <span className="text-slate-500">Gross Earnings</span>
                    <span className="text-slate-900">R {ride.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-slate-500">Items Delivered</span>
                    <span className="text-emerald-600 font-black text-[10px] uppercase bg-emerald-50 px-3 py-1 rounded-full">
                        {items.length} Items
                    </span>
                </div>
                <div className="h-px bg-slate-200 w-full my-4 border-dashed border-b" />
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                    <span className="uppercase tracking-widest">Platform (10%)</span>
                    <span>- R {commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                    <span className="text-slate-900 font-black text-lg uppercase tracking-tight">Net Profit</span>
                    <span className="text-emerald-600 font-black text-4xl tracking-tighter">R {netProfit.toFixed(0)}</span>
                </div>
            </div>
            
            <div className="bg-primary/10 px-6 py-3 rounded-full flex items-center gap-3 border border-primary/20 shadow-sm">
                <Icon name="account_balance_wallet" className="text-primary" />
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">Funds added to wallet</p>
            </div>
        </main>

        <footer className="p-8 bg-white/80 backdrop-blur-md border-t border-slate-200 pb-safe-action">
            <button 
                onClick={() => completeRide()}
                className="w-full h-18 rounded-2xl bg-primary text-white font-black text-base shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3"
            >
                Finish & Settle
                <Icon name="check" className="text-xl" />
            </button>
        </footer>
      </div>,
      document.body
    );
  }

  return null;
};
