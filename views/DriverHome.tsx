
import React, { useState, useEffect, useMemo } from 'react';
import { RideRequest, RideStatus, PaymentMethod, TransactionType, ErrandCategory } from '../types';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { RideService } from '../services/RideService';
import { LocationService } from '../services/LocationService';
import { RideFlow } from '../components/driver/RideFlow';
import { ErrandFlow } from '../components/driver/ErrandFlow';
import { MoverFlow } from '../components/driver/flows/MoverFlow';
import { JobOfferModal } from '../components/driver/JobOfferModal';
import { BottomSheet } from '../components/BottomSheet';
import { Icon } from '../components/Icons';
import { ComplianceBlocker } from '../components/driver/ComplianceBlocker';
import { PanicButton } from '../components/PanicButton';
import { MapViz } from '../components/MapViz';

export const DriverHome: React.FC = () => {
  const { activeRide, setActiveRide, updateRideStatus, user, availableJobs, setAvailableJobs, selectedJob, setSelectedJob, toggleDutyStatus } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'NEARBY' | 'RIDE' | 'ERRAND' | 'MOVE'>('ALL');
  
  const currentBalance = user?.wallet.balance || 0;
  const isBlocked = currentBalance <= -200;
  const isOnline = user?.isOnline ?? true;

  // --- OPTIMIZED EARNINGS LOGIC ---
  const todaysEarnings = user?.wallet.todaysEarnings || 0;

    const [currentProvince, setCurrentProvince] = useState<string>('Detecting...');

    useEffect(() => {
        let watchId: number | null = null;

        const startWatching = () => {
            if ('geolocation' in navigator) {
                watchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        const province = LocationService.getProvince(pos.coords.latitude, pos.coords.longitude);
                        setCurrentProvince(province);
                    },
                    (err) => {
                        console.error("Province Watch Error:", err);
                        setCurrentProvince('Unknown');
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            }
        };

        startWatching();

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    useEffect(() => {
        if (!isBlocked && user?.phone && !user.isDemo && isOnline) {
          LocationService.startTracking(user.id); 
      } else {
          LocationService.stopTracking();
      }
  }, [isBlocked, user?.id, user?.isDemo, isOnline]);

  const mapDbRideToRequest = (r: any): RideRequest => {
      const details = r.errand_details || {};
      return {
        id: r.id, type: r.type || 'ride',
        pickup: { address: r.pickup_address, lat: r.pickup_lat, lng: r.pickup_lng },
        dropoff: { address: r.dropoff_address, lat: r.dropoff_lat, lng: r.dropoff_lng },
        price: r.price, paymentMethod: r.payment_method as PaymentMethod, distance: '2.5 km', status: r.status as RideStatus || RideStatus.IDLE,
        otp: r.otp,
        stops: r.stops || [],
        currentStopIndex: r.current_stop_index || 0,
        driver_id: r.driver_id,
        errandDetails: (r.type === 'errand' || r.type === 'move') ? { 
            category: details.category || r.category || (r.type === 'move' ? ErrandCategory.HOME_ESSENTIALS : ErrandCategory.GROCERY_SHOPPING),
            items: details.items || r.items || [], 
            instructions: details.instructions || r.instructions || '',
            recipientName: details.recipientName || r.recipient_name || 'Customer',
            packageSize: details.packageSize || r.package_size || 'medium',
            helpersCount: details.helpersCount || r.helpers_count
        } : undefined
      };
  };

  useEffect(() => {
      if (activeRide || isBlocked || !user) return;

      if (user.isDemo && availableJobs.length === 0) {
          setAvailableJobs(MOCK_JOBS);
          return;
      }

      if (!user.isDemo) {
          // 1. Fetch existing available jobs
          const fetchJobs = async () => {
              const { data, error } = await supabase
                  .from('rides')
                  .select('*')
                  .or(`status.eq.SEARCHING,and(status.eq.DRIVER_ASSIGNED,driver_id.eq.${user.id})`);
              
              if (!error && data) {
                  const mappedJobs = data.map(mapDbRideToRequest);
                  setAvailableJobs(mappedJobs);
                  
                  // Auto-pop if assigned directly to this driver
                  const assignedJob = mappedJobs.find(j => j.driver_id === user.id && j.status === 'DRIVER_ASSIGNED');
                  if (assignedJob && !selectedJob) {
                      setSelectedJob(assignedJob);
                  }
              }
          };
          fetchJobs();

          // 2. Subscribe to new jobs
          const channel = supabase.channel('public:rides')
              .on('postgres_changes', { 
                  event: 'INSERT', 
                  schema: 'public', 
                  table: 'rides',
              }, payload => {
                  const newJob = mapDbRideToRequest(payload.new);
                  if (newJob.status === 'SEARCHING' || (newJob.status === 'DRIVER_ASSIGNED' && newJob.driver_id === user.id)) {
                      setAvailableJobs(prev => [...prev, newJob]);
                      if (newJob.status === 'DRIVER_ASSIGNED' && newJob.driver_id === user.id && !selectedJob) {
                          setSelectedJob(newJob);
                      }
                  }
              })
              .on('postgres_changes', {
                  event: 'UPDATE',
                  schema: 'public',
                  table: 'rides',
              }, payload => {
                  const updated = payload.new;
                  // If assigned to me
                  if (updated.status === 'DRIVER_ASSIGNED' && updated.driver_id === user.id) {
                      const job = mapDbRideToRequest(updated);
                      setAvailableJobs(prev => {
                          if (!prev.find(j => j.id === job.id)) return [...prev, job];
                          return prev.map(j => j.id === job.id ? job : j);
                      });
                      if (!selectedJob) setSelectedJob(job);
                  } else if (updated.status === 'SEARCHING') {
                      // Update job details if still searching
                      const job = mapDbRideToRequest(updated);
                      setAvailableJobs(prev => prev.map(j => j.id === job.id ? job : j));
                  } else {
                      // If taken by someone else, canceled, or completed
                      setAvailableJobs(prev => prev.filter(j => j.id !== updated.id));
                      if (selectedJob?.id === updated.id) setSelectedJob(null);
                  }
              })
              .subscribe();

          return () => {
              supabase.removeChannel(channel);
          };
      }
  }, [activeRide, isBlocked, user?.id, user?.isDemo]); 

  const handleAcceptJob = async (job: RideRequest) => {
    if (!user) return;
    try {
        // Get current location for jurisdiction check
        const pos = await new Promise<GeolocationPosition>((res, rej) => {
            navigator.geolocation.getCurrentPosition(res, rej);
        });

        await RideService.acceptRide(
            job.id, 
            user.id, 
            user.licensedProvince || 'Gauteng', // Default to Gauteng for existing users
            job.pickup.lat, 
            job.pickup.lng,
            job.type
        );

        const acceptedRide: RideRequest = { 
            ...job, status: RideStatus.ACCEPTED, 
            driver: { id: user.id, name: user.name, vehicle: user.vehicleType || 'Car', plate: 'SA-MZANSI', phone: user.phone, rating: user.rating || 5.0 }
        };
        setActiveRide(acceptedRide);
        setSelectedJob(null);
    } catch (e: any) {
        if(job.id.startsWith('mock')) {
             // Mock fallback
             setActiveRide({ ...job, status: RideStatus.ACCEPTED, driver: { id: user.id, name: user.name, vehicle: 'Car', plate: 'TEST-GP', phone: user.phone, rating: 5.0 } });
             setSelectedJob(null);
        } else {
             alert(e.message); // Show Jurisdiction Error
        }
    }
  };

    if (activeRide) {
        return (
          <div className="w-full h-full bg-transparent pointer-events-none">
              <MapViz isGlobal={true} />
              <div className="fixed top-0 left-0 right-0 p-2 pt-safe-top z-20">
                  <div className="bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-[2rem] shadow-2xl border border-white/10 pointer-events-auto flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-brand-teal/20 flex items-center justify-center shrink-0">
                          <Icon name="navigation" className="text-brand-teal text-2xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                           <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-0.5">
                               {activeRide.status === RideStatus.IN_PROGRESS ? 'Heading To' : 'Pickup At'}
                           </p>
                           <h3 className="text-sm font-black truncate leading-tight">
                               {activeRide.status === RideStatus.IN_PROGRESS ? activeRide.dropoff.address.split(',')[0] : activeRide.pickup.address.split(',')[0]}
                           </h3>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                          <PanicButton rideId={activeRide.id} mini />
                          <button 
                              onClick={() => window.open(`google.navigation:q=${activeRide.status === RideStatus.IN_PROGRESS ? activeRide.dropoff.lat : activeRide.pickup.lat},${activeRide.status === RideStatus.IN_PROGRESS ? activeRide.dropoff.lng : activeRide.pickup.lng}`)} 
                              className="bg-brand-teal hover:bg-[#20d87d] text-slate-900 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-teal/20 active:scale-95 transition-all"
                          >
                              NAV
                          </button>
                      </div>
                  </div>
              </div>
              
              <div className="pointer-events-auto fixed inset-0 z-30 bg-transparent overflow-hidden">
                  <div className="h-[100dvh] flex flex-col">
                      <div className="flex-1 overflow-hidden">
                          {activeRide.type === 'ride' && <RideFlow ride={activeRide} onStatusUpdate={updateRideStatus} />}
                          {activeRide.type === 'errand' && <ErrandFlow ride={activeRide} onStatusUpdate={updateRideStatus} />}
                          {activeRide.type === 'move' && <MoverFlow ride={activeRide} onStatusUpdate={updateRideStatus} />}
                      </div>
                  </div>
              </div>
          </div>
        );
    }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden pointer-events-none bg-transparent">
        {selectedJob && (
            <div className="pointer-events-auto relative z-[70]">
                <JobOfferModal job={selectedJob} onAccept={handleAcceptJob} onDecline={() => setSelectedJob(null)} />
            </div>
        )}

        <header className="fixed top-0 left-0 right-0 z-20 p-4 pt-safe-top pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
                <button 
                    onClick={() => toggleDutyStatus(!isOnline)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg border transition-all active:scale-95 ${isOnline ? 'bg-white/90 border-brand-teal/30' : 'bg-slate-800/90 border-white/10'}`}
                >
                    <div className={`size-2 rounded-full ${isOnline ? 'bg-brand-teal animate-pulse' : 'bg-slate-500'}`}></div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isOnline ? 'text-slate-900' : 'text-slate-400'}`}>
                        {isOnline ? `Online • ${currentProvince}` : 'Offline'}
                    </span>
                </button>
                <div className="bg-slate-900 text-white px-5 py-2 rounded-full shadow-lg">
                    <p className="text-[11px] font-bold">Today: <span className="text-brand-teal font-black">R{todaysEarnings.toFixed(0)}</span></p>
                </div>
            </div>
        </header>

        <div className="pointer-events-none">
            <BottomSheet 
                title={availableJobs.length > 0 ? `Nearby Work (${availableJobs.length})` : "Scanning..."} 
                isOpen={false} 
                collapsedIcon="radar"
                maxHeight="max-h-[40vh]"
            >
                <div className="px-6 py-4 space-y-3 pb-nav">
                    {availableJobs.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <span className="material-symbols-rounded text-4xl mb-2 opacity-30">radar</span>
                            <p className="text-xs font-bold uppercase">No jobs nearby</p>
                            <p className="text-[10px]">Move to a busier area.</p>
                        </div>
                    )}
                    {availableJobs.map(job => (
                        <div 
                            key={job.id} 
                            onClick={() => setSelectedJob(job)} 
                            className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer hover:border-brand-teal/30 gap-2"
                        >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${job.type === 'errand' ? 'bg-blue-50 text-blue-600' : job.type === 'move' ? 'bg-purple-50 text-purple-600' : 'bg-brand-teal/10 text-brand-teal'}`}>
                                    <Icon name={job.type === 'ride' ? 'local_taxi' : job.type === 'errand' ? 'directions_run' : 'local_shipping'} className="text-lg" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-[10px] font-black text-slate-900 leading-tight truncate pr-1">{job.pickup.address.split(',')[0]}</h4>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest shrink-0">{job.type}</span>
                                        <span className="text-[7px] font-black text-slate-300">•</span>
                                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest shrink-0">{job.distance}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-black text-xs text-slate-900 leading-none">R{job.price.toFixed(0)}</p>
                                <p className="text-[7px] font-bold text-brand-teal mt-0.5 uppercase tracking-tighter">Ready</p>
                            </div>
                        </div>
                    ))}
                </div>
            </BottomSheet>
        </div>
        
        {/* Compliance Blocker Overlay */}
        <ComplianceBlocker />
    </div>
  );
};

const MOCK_JOBS: RideRequest[] = [
    { 
        id: 'mock_1', 
        type: 'errand', 
        price: 145, 
        distance: '3.2 km', 
        pickup: { address: 'Checkers Hyper, Sandton City', lat: -26.1076, lng: 28.0567 }, 
        dropoff: { address: '150 Rivonia Rd, Morningside', lat: -26.0900, lng: 28.0600 }, 
        paymentMethod: PaymentMethod.CARD, 
        status: RideStatus.IDLE, 
        stops: [],
        currentStopIndex: 0,
        errandDetails: { 
            category: ErrandCategory.GROCERY_SHOPPING, 
            recipientName: 'Lerato', 
            packageSize: 'medium', 
            instructions: 'Please get the items on the list. Call if out of stock.', 
            items: [
                {id:'1', name: 'Milk 2L Full Cream', quantity: '2', status: 'PENDING', estimatedPrice: 34.99, brand: 'Clover'}, 
                {id:'2', name: 'White Bread', quantity: '1', status: 'PENDING', estimatedPrice: 18.50, brand: 'Albany'},
                {id:'3', name: 'Eggs 18pk', quantity: '1', status: 'PENDING', estimatedPrice: 59.99, brand: 'Nulaid'}
            ] 
        } 
    },
    { 
        id: 'mock_2', 
        type: 'move', 
        price: 850, 
        distance: '12.5 km', 
        pickup: { address: 'Bryanston Shopping Centre', lat: -26.0700, lng: 28.0200 }, 
        dropoff: { address: 'Waterfall City', lat: -26.0100, lng: 28.1000 }, 
        paymentMethod: PaymentMethod.PAYSTACK, 
        status: RideStatus.IDLE, 
        stops: [
            { id: 's1', type: 'PICKUP', address: 'Bryanston Shopping Centre', lat: -26.0700, lng: 28.0200, status: 'PENDING' },
            { id: 's2', type: 'DROPOFF', address: 'Waterfall City', lat: -26.0100, lng: 28.1000, status: 'PENDING' }
        ],
        currentStopIndex: 0,
        errandDetails: { 
            category: ErrandCategory.HOME_ESSENTIALS, 
            recipientName: 'Sipho', 
            packageSize: 'furniture', 
            instructions: 'Moving a fridge and a washing machine. Need 1 helper.', 
            helpersCount: 1 
        } 
    },
    { 
        id: 'mock_3', 
        type: 'errand', 
        price: 220, 
        distance: '5.8 km', 
        pickup: { address: 'Home Affairs, Randburg', lat: -26.0900, lng: 27.9800 }, 
        dropoff: { address: 'Ferndale', lat: -26.0800, lng: 28.0000 }, 
        paymentMethod: PaymentMethod.CASH, 
        status: RideStatus.IDLE, 
        stops: [],
        currentStopIndex: 0,
        errandDetails: { 
            category: ErrandCategory.GOVT_QUEUE, 
            recipientName: 'Kabelo', 
            packageSize: 'small', 
            instructions: 'Queue for passport collection. I will meet you there in 1 hour.', 
            items: [] 
        } 
    }
];
