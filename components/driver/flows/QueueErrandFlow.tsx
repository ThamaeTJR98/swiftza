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

interface ErrandFlowProps {
  ride: RideRequest;
  onStatusUpdate: (status: RideStatus, data?: any) => void;
}

type QueueState = 'NAV_TO_STOP' | 'ARRIVED_AT_STOP' | 'QUEUEING' | 'CARD_ACTIVATION' | 'PAYMENT_SUCCESS' | 'HANDOVER' | 'ABANDON_QUEUE' | 'SETTLEMENT';

export const QueueErrandFlow: React.FC<ErrandFlowProps> = ({ ride, onStatusUpdate }) => {
  const { completeRide } = useApp();
  
  // Multi-Stop Logic
  const currentStopIndex = ride.currentStopIndex || 0;
  const stops: RideStop[] = ride.stops && ride.stops.length > 0 
    ? ride.stops 
    : [
        { id: 'pickup', type: 'QUEUE', address: ride.pickup.address, lat: ride.pickup.lat, lng: ride.pickup.lng, status: 'PENDING' },
        { id: 'dropoff', type: 'DROPOFF', address: ride.dropoff.address, lat: ride.dropoff.lat, lng: ride.dropoff.lng, status: 'PENDING' }
      ];
  const currentStop: RideStop | undefined = stops[currentStopIndex];
  const isLastStop = currentStopIndex >= stops.length - 1;

  const [localState, setLocalState] = useState<QueueState>('NAV_TO_STOP');
  const [showEscrow, setShowEscrow] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  // Queue States
  const [isQueueing, setIsQueueing] = useState(false);
  const [queueStartTime, setQueueStartTime] = useState<number | null>(null);
  const [queueElapsed, setQueueElapsed] = useState(0);
  const [currentFee, setCurrentFee] = useState(0);
  const [gpsVerified, setGpsVerified] = useState(true);
  const [proofPhotos, setProofPhotos] = useState<string[]>([]);
  const proofInputRef = useRef<HTMLInputElement>(null);
  
  // Incidental Payment State
  const [incidentalAmount, setIncidentalAmount] = useState('');
  const [cardTimer, setCardTimer] = useState(120);
  
  // Interactive Navigation Simulation
  const [navDistance, setNavDistance] = useState(400);

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
            setLocalState('QUEUEING');
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
    if (isQueueing && gpsVerified) {
        interval = setInterval(() => {
            setQueueElapsed(prev => {
                const newElapsed = prev + 1;
                // Calculate fee: R5.00 per minute (simulated)
                const minutes = Math.ceil(newElapsed / 60);
                setCurrentFee(minutes * 5); 
                return newElapsed;
            });
            // Simulate random GPS check
            if (Math.random() < 0.05) {
                setGpsVerified(true); 
            }
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [isQueueing, gpsVerified]);

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

  const handleProofPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setProofPhotos(prev => [...prev, ev.target!.result as string]);
                alert("Proof of Presence Verified!");
            }
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const startQueueTimer = () => {
    setIsQueueing(true);
    setQueueStartTime(Date.now());
  };

  const stopQueueTimer = () => {
    setIsQueueing(false);
    const durationMinutes = Math.floor(queueElapsed / 60);
    
    const updateData = { 
        errandDetails: { 
            ...ride.errandDetails, 
            queueStartTime: new Date(queueStartTime!).toISOString(),
            queueEndTime: new Date().toISOString(),
            queueDurationMinutes: durationMinutes,
            queueLocationVerified: true
        } 
    };
    
    // If not last stop, we move to next stop (IN_PROGRESS)
    if (!isLastStop) {
        onStatusUpdate(RideStatus.IN_PROGRESS, { 
            stopCompleted: true, 
            stopId: currentStop?.id,
            ...updateData
        });
        setQueueElapsed(0);
        setQueueStartTime(null);
    } else {
        // If last stop, we go to handover
        onStatusUpdate(RideStatus.ARRIVED_DROPOFF, updateData);
    }
  };

  const handleStopArrival = () => {
    if (currentStop?.type === 'QUEUE' || currentStop?.type === 'PICKUP') {
        onStatusUpdate(RideStatus.ARRIVED_PICKUP);
    } else {
        onStatusUpdate(RideStatus.ARRIVED_DROPOFF);
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

  const handleScan = (data: string) => {
      setShowScanner(false);
      if (data) {
          // In real app, verify data against ride ID or secret
          setShowEscrow(true);
      }
  };

  if (!currentStop) return null;

  // --- VIEW 1: NAVIGATING TO QUEUE ---
  if (localState === 'NAV_TO_STOP') {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center bg-white/80 backdrop-blur-md p-6 justify-between border-b border-slate-200">
            <div className="flex items-center gap-4">
                <button onClick={() => alert("Cancel Navigation")} className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 active:scale-90 transition-all">
                    <Icon name="arrow_back" />
                </button>
                <div>
                    <h2 className="text-xl font-black tracking-tight leading-none mb-1 text-slate-900">Navigate to Queue</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Job</p>
                </div>
            </div>
            <button className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 active:scale-90 transition-all">
                <Icon name="more_vert" />
            </button>
        </div>

        {/* Map Area (Main View) */}
        <div className="relative flex-1 w-full bg-slate-200 overflow-hidden">
            {/* Mock Map Background */}
            <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA4_FvXB5KO0OgAq8Rjre1IKsauOh_zqBUUQV2LaH5FmoVgTDse9436JJ3sTCUb0ibcIkLF-aREsBUmNeVY8QkUA8aCG0u4s4pMFL5Cpa85RaMBoG9pEsHTqagFN5BmFQ3BWohqtFVcm7r206PgXDllSUF-ikANqTNK47FKWr9FjOyC7y2irRg3sPXf-AZxg-h8V1NDM04F-68aqfHfhd6WEaMGErX9-ncgqAa8D8vw0sr5UAMOm0_I45wB4X33a3NZ-cWpHIthnDRJ')" }}>
            </div>

            {/* Navigation Overlay Elements */}
            <div className="relative z-10 flex flex-col h-full p-6 pt-28 pb-48">
                {/* Search/Destination Header */}
                <div className="w-full max-w-md mx-auto">
                    <div className="flex w-full items-stretch rounded-2xl h-16 bg-white/95 backdrop-blur-md shadow-xl border border-slate-200">
                        <div className="flex items-center justify-center pl-5 text-primary">
                            <Icon name="location_on" className="text-xl" />
                        </div>
                        <input 
                            className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:outline-0 focus:ring-0 px-4 text-slate-900 font-bold text-base" 
                            placeholder="Route to Destination" 
                            readOnly 
                            value={currentStop.address.split(',')[0]} 
                        />
                        <div className="flex items-center justify-center pr-5 text-slate-400">
                            <Icon name="directions" className="text-xl" />
                        </div>
                    </div>
                </div>

                {/* Map Controls */}
                <div className="mt-auto flex flex-col items-end gap-3">
                    <div className="flex flex-col shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                        <button className="flex size-14 items-center justify-center bg-white/95 backdrop-blur-md text-slate-700 border-b border-slate-100 active:bg-slate-50 transition-colors">
                            <Icon name="add" className="text-xl" />
                        </button>
                        <button className="flex size-14 items-center justify-center bg-white/95 backdrop-blur-md text-slate-700 active:bg-slate-50 transition-colors">
                            <Icon name="remove" className="text-xl" />
                        </button>
                    </div>
                    <button className="flex size-14 items-center justify-center rounded-2xl bg-white/95 backdrop-blur-md text-primary shadow-xl border border-slate-200 active:scale-95 transition-all">
                        <Icon name="navigation" className="text-xl" style={{ transform: 'rotate(-45deg)' }} />
                    </button>
                </div>
            </div>
        </div>

        {/* Bottom Sheet */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-stretch bg-white rounded-t-[2.5rem] shadow-[0_-8px_30px_rgb(0,0,0,0.12)] border-t border-slate-200">
            {/* Handle */}
            <div className="flex h-8 w-full items-center justify-center">
                <div className="h-1.5 w-12 rounded-full bg-slate-200 mt-2"></div>
            </div>
            <div className="px-8 pt-2 pb-10">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-slate-900 text-2xl font-black leading-tight tracking-tight">Queue Standing</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Icon name="schedule" className="text-sm text-primary" />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Est. 45 mins wait</p>
                        </div>
                    </div>
                    <div className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        <span className="text-primary font-black text-xs uppercase tracking-widest">R5.00/min</span>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                                <Icon name="person_pin_circle" className="text-xl" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-0.5">Location</p>
                                <p className="text-slate-900 font-bold text-sm">{currentStop.address.split(',')[0]}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-0.5">Distance</p>
                            <p className="text-slate-900 font-black text-lg">{navDistance}m</p>
                        </div>
                    </div>
                </div>

                {/* Slide to Arrive Action */}
                <div className="relative w-full h-18 bg-slate-100 rounded-2xl flex items-center p-1.5 overflow-hidden group border border-slate-200">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Slide to Arrive</span>
                    </div>
                    {/* Interactive Handle Mock */}
                    <div 
                        onClick={handleStopArrival}
                        className="h-15 w-16 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg cursor-pointer z-10 active:scale-95 transition-transform"
                    >
                        <Icon name="chevron_right" className="text-2xl" />
                    </div>
                    {/* Progress Background */}
                    <div className="absolute left-0 top-0 bottom-0 bg-primary/10 w-16 rounded-2xl transition-all group-active:w-full"></div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4 mt-6">
                    <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-700 active:scale-95 transition-all">
                        <Icon name="chat" className="text-lg" />
                        <span>Chat</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-3 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-700 active:scale-95 transition-all">
                        <Icon name="call" className="text-lg" />
                        <span>Call</span>
                    </button>
                </div>
            </div>
        </div>
      </div>,
      document.body
    );
  }

  // --- VIEW 2: ARRIVED AT QUEUE ---
  if (localState === 'ARRIVED_AT_STOP') {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBv7st5-ZfPXMBjAYk0-5GBzJze-GG0JFNLofMH0cCtXJUL5PGnnm4Rb5jqp7gXE6s5cesRH5arSUpsdTYdy0g16tBsB2ir0xhX1cYpsdHBHIJZm6Opn2UcWq7iVd5yMYgTVqMgHZoLXDyGfoXh1Y2cnOIc4Fw3DkBfTCXIPxgXQMn88pyuu0q4SEujCfQL8KNttoKVDin5M2a2QL-Z7NqPBMV0c3yQ-8IRRgpEg_v97NxdaF8hQOxyMQvktKAQg3pdJy-P7RNb-CWP')" }}>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md"></div>
        </div>

        <header className="relative z-10 flex items-center bg-white/80 backdrop-blur-xl p-6 justify-between border-b border-slate-200">
            <button onClick={() => onStatusUpdate(RideStatus.IN_PROGRESS)} className="size-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 active:scale-90 transition-all">
                <Icon name="arrow_back" />
            </button>
            <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase tracking-widest">Runner Queue</h2>
            <div className="size-12"></div>
        </header>

        <main className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-12">
            <div className="w-full max-w-lg mx-auto bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-200 p-8 flex flex-col gap-8">
                <div className="flex items-start gap-5">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                        <Icon name="location_on" className="text-3xl" />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-slate-900 text-2xl font-black leading-tight mb-1">{currentStop.address.split(',')[0]}</h3>
                        <p className="text-slate-500 text-sm font-medium">{currentStop.address}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Arrival Status</span>
                        <span className="flex items-center gap-1.5 text-emerald-600 font-black text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                            <Icon name="check_circle" className="text-sm" />
                            ARRIVED
                        </span>
                    </div>
                    <div className="h-px bg-slate-200 w-full my-2 border-dashed border-b" />
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Est. Base Fee</span>
                        <span className="text-slate-900 font-black text-lg">ZAR 45.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Queue Rate</span>
                        <span className="text-primary font-black text-lg">ZAR 5.00 <span className="text-xs text-slate-400">/ min</span></span>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => onStatusUpdate(RideStatus.SHOPPING)}
                        className="w-full h-18 bg-primary text-white rounded-2xl font-black text-base uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 transition-all active:scale-[0.98]"
                    >
                        <Icon name="timer" className="text-2xl" />
                        Start Queue Timer
                    </button>
                    <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed px-4">
                        Timer will calculate your earnings based on waiting time at this location.
                    </p>
                </div>
            </div>
        </main>

        <div className="absolute right-6 top-32 z-10 flex flex-col gap-3">
            <button className="flex size-14 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-md text-slate-700 shadow-xl border border-slate-200 active:scale-95 transition-all">
                <Icon name="add" className="text-xl" />
            </button>
            <button className="flex size-14 items-center justify-center rounded-2xl bg-white/90 backdrop-blur-md text-slate-700 shadow-xl border border-slate-200 active:scale-95 transition-all">
                <Icon name="remove" className="text-xl" />
            </button>
            <button className="mt-2 flex size-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 transition-all">
                <Icon name="my_location" className="text-xl" />
            </button>
        </div>
      </div>,
      document.body
    );
  }

  // --- VIEW 3: QUEUEING TIMER ---
  if (localState === 'QUEUEING') {
    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleForceComplete = () => {
        setLocalState('ABANDON_QUEUE');
    };

    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
            <div className="max-w-md mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Icon name="hourglass_top" className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight leading-none mb-1">QueueRunner</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Session</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">GPS Verified</span>
                </div>
            </div>
        </nav>

        <main className="flex-1 max-w-md mx-auto px-6 py-8 flex flex-col gap-8 w-full overflow-y-auto pb-32">
            <header className="text-center space-y-4">
                <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10 text-6xl md:text-7xl font-black text-white tabular-nums tracking-tighter mb-4">
                        {formatTime(queueElapsed)}
                    </div>
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        <div className="size-2 rounded-full bg-primary animate-ping"></div>
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Session Ticking</span>
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Est. Earnings</p>
                    <div className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">
                        R {currentFee.toFixed(0)}
                    </div>
                    <p className="text-[10px] text-primary font-black mt-2 uppercase tracking-tighter">+ R 5.00 / min</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Position</p>
                    <div className="text-3xl font-black text-slate-900 tracking-tight">
                        #4 <span className="text-slate-400 text-xs font-bold uppercase tracking-widest ml-1">in line</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-tighter">Updated 2m ago</p>
                </div>
            </section>

            <section className="bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">{currentStop.address.split(',')[0]}</h3>
                        <p className="text-xs font-medium text-slate-500">{currentStop.address}</p>
                    </div>
                    <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <Icon name="info" className="text-slate-400" />
                    </div>
                </div>
                <div className="relative h-56 bg-slate-200">
                    <img className="w-full h-full object-cover grayscale-[20%]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhrSkoWXcNZFr_qfpBL11F9IMR7PSP3SphdvsVL9LDalCUUg1NiSm4T5I9ZXn22DF_A-cimqfxsGJQ1J0IlaIvpaGKVhS3gbl5GCkJj3F0BDniolDqt-N3EbYBkmO2Wp9thijFN9N9aoGhVvo2r0TIi0TIYmAB3KxGwvrzEpkah0fj9kwbmMAdFhwreFe5dLcPfq_A1Viq7KAvX4HPMlnTaGKTHCf8XyXyKlOJ5zdm31PhupGgqY4pSTPFwCeQ6zdq9SHuypPVxw7F" alt="Map view" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-3 border border-white/20">
                            <div className="size-2 rounded-full bg-primary animate-ping"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">At Verified Location</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col gap-4">
                <input type="file" ref={proofInputRef} className="hidden" accept="image/*" onChange={handleProofPhotoSelect} />
                <button 
                    onClick={() => proofInputRef.current?.click()}
                    className="w-full h-18 bg-white text-slate-900 font-black rounded-2xl border-2 border-slate-200 flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                >
                    <Icon name="photo_camera" className="text-primary text-xl" />
                    Take Proof Photo
                </button>
                <button 
                    onClick={stopQueueTimer}
                    className="w-full h-18 bg-primary text-white font-black rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                >
                    <Icon name="check_circle" className="text-xl" />
                    {isLastStop ? 'Handover Spot' : 'Next Stop'}
                </button>
                <button 
                    onClick={() => setShowCostModal(true)}
                    className="w-full h-18 bg-slate-100 text-slate-600 font-black rounded-2xl flex items-center justify-center gap-3 border border-slate-200 active:scale-[0.98] transition-all uppercase tracking-widest text-sm"
                >
                    <Icon name="payments" className="text-primary text-xl" />
                    Request Incidental Funds
                </button>
            </div>

            <div className="mt-4 pt-8 border-t border-slate-200 text-center pb-12">
                <button 
                    onClick={handleForceComplete}
                    className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto hover:text-red-500 transition-colors py-4"
                >
                    <Icon name="logout" className="text-base" />
                    Abandon Queue
                </button>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-12">
                    Abandoning a queue after 30 minutes may result in a penalty to your runner rating.
                </p>
            </div>
        </main>
        
        <IncidentalCostModal 
            isOpen={showCostModal}
            onClose={() => setShowCostModal(false)}
            onConfirm={handleIncidentalRequest}
            title="Authorize On-Site Fee"
        />
      </div>,
      document.body
    );
  }

  // --- VIEW 4: ABANDON QUEUE ---
  if (localState === 'ABANDON_QUEUE') {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-background-light flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4">
            <div className="max-w-md mx-auto flex items-center justify-between">
                <button onClick={() => setLocalState('QUEUEING')} className="size-12 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-600 active:scale-90 transition-all">
                    <Icon name="close" />
                </button>
                <h2 className="text-lg font-black tracking-tight uppercase tracking-widest text-slate-900">Leave Early</h2>
                <div className="size-12"></div>
            </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full p-6 space-y-8 overflow-y-auto pb-32">
            {/* Progress Overview */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
                <div className="flex justify-between items-center">
                    <p className="text-slate-900 text-lg font-black uppercase tracking-tight">Queue Progress</p>
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100">Partial</span>
                </div>
                <div className="relative w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Started {Math.floor(queueElapsed / 60)} mins ago</p>
                    <p className="text-slate-900 font-black">50% Complete</p>
                </div>
            </div>

            <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Reason for Leaving</h3>
                <div className="space-y-3">
                    {['Personal Emergency', 'Technical / App Issues', 'Venue Conditions', 'Other'].map((reason, idx) => (
                        <label key={idx} className="flex items-center gap-5 rounded-2xl border border-slate-200 p-5 cursor-pointer hover:bg-slate-50 transition-all group">
                            <div className="relative flex items-center justify-center">
                                <input type="radio" name="leave-reason" className="size-6 border-2 border-slate-300 bg-transparent text-primary focus:ring-primary transition-all" defaultChecked={idx === 0} />
                            </div>
                            <p className="text-slate-900 text-sm font-black uppercase tracking-widest group-hover:text-primary transition-colors">{reason}</p>
                        </label>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Partial Payout Summary</h3>
                <div className="p-8 rounded-[2rem] bg-slate-900 shadow-xl space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-400 uppercase tracking-widest">Time spent ({Math.floor(queueElapsed / 60)} mins)</span>
                            <span className="text-white">R {currentFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-400 uppercase tracking-widest">Early leave adjustment (15%)</span>
                            <span className="text-red-400">- R {(currentFee * 0.15).toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="h-px bg-white/10 border-dashed border-b"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-white font-black text-lg uppercase tracking-tight">Est. Payout</span>
                        <span className="text-primary text-4xl font-black tracking-tighter">R {(currentFee * 0.85).toFixed(0)}</span>
                    </div>
                </div>
            </section>

            <div className="p-6 bg-blue-50 rounded-2xl flex gap-4 border border-blue-100">
                <Icon name="info" className="text-blue-500 text-xl shrink-0" />
                <p className="text-[10px] text-blue-700 font-bold uppercase tracking-widest leading-relaxed">
                    Leaving early will finalize your current session. You will be paid for the time spent, minus the early departure adjustment.
                </p>
            </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 pb-safe-action z-20">
            <div className="max-w-md mx-auto p-6">
                <button 
                    onClick={() => onStatusUpdate(RideStatus.COMPLETED)}
                    className="w-full h-18 bg-red-500 text-white font-black rounded-2xl shadow-2xl shadow-red-200 flex items-center justify-center gap-3 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-sm"
                >
                    Confirm & Leave
                    <Icon name="logout" className="text-xl" />
                </button>
            </div>
        </footer>
      </div>,
      document.body
    );
  }

  // --- VIEW 5: CARD ACTIVATION (JIT FUNDING) ---
  if (localState === 'CARD_ACTIVATION') {
      const formatTime = (seconds: number) => {
          const mins = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

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
                      onClick={() => setLocalState('QUEUEING')}
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
                      onClick={() => setLocalState('QUEUEING')}
                      className="w-full max-w-xs h-16 bg-slate-900 text-white rounded-3xl font-black text-base shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                      Continue Queue
                      <Icon name="arrow_forward" />
                  </button>
              </div>
          </div>,
          document.body
      );
  }

  // --- VIEW 5: HANDOVER HANDSHAKE ---
  if (localState === 'HANDOVER') {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col font-sans h-[100dvh] w-full animate-fade-in overflow-hidden">
        {/* Immersive Scanner Background */}
        <div className="absolute inset-0 bg-slate-900">
            <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAAEX8fRJwH0wsI19Qjp7VW0BJXJosfF6ri1Q2U2i5fs1KIqGklEWuzifhk39vjX14hpreYB6RKtxzSibOAEL4k4qWvfZSeLBUMALi1pjKZhV4TYhM0STY5mBzRoMD_cmzJLpkKMZqoADIdtVs-ZtIaLA2DAO3_jlXxtLUvMdVFQnBG84Om_in2QfdMz9rP1--FdCCAhfe7QZNtrbMSJWBZXPys-nAZeIiXrJglh4gjSSk9B-5U6PHPTd30LxkoqSa33O43m4ofuLMr')" }}></div>
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
                <h2 className="text-white text-3xl font-black leading-tight mb-2">Scan Client QR</h2>
                <p className="text-white/60 text-sm font-medium">Position the client's QR code in the frame</p>
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
                            <Icon name="hourglass_top" className="text-primary text-2xl" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Queue Runner</p>
                            <h3 className="text-slate-900 text-xl font-black leading-none">#{ride.id.substring(0, 8)}</h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-emerald-500 text-xl font-black leading-none">R {ride.price.toFixed(2)}</p>
                        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">Total Earnings</p>
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
                        onClick={() => alert("Calling Client...")}
                        className="h-16 bg-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Icon name="call" />
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
            title="Scan Client QR"
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

  // --- VIEW 7: SETTLEMENT ---
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
                    <span className="text-slate-500">Queue Duration</span>
                    <span className="text-emerald-600 font-black text-[10px] uppercase bg-emerald-50 px-3 py-1 rounded-full">
                        {Math.floor(queueElapsed / 60)} mins
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
