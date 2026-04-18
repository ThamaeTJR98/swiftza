
import React, { useEffect, useState } from 'react';
import { AppView, RideStatus } from '../types';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { RideService } from '../services/RideService';

export const FindingRunner: React.FC = () => {
  const { setView, setActiveRide, activeRide } = useApp();
  const [searchState, setSearchState] = useState<'SEARCHING' | 'FOUND' | 'FAILED'>('SEARCHING');
  
  useEffect(() => {
    if (!activeRide?.id) return;

    // --- REALTIME SUBSCRIPTION VIA SERVICE ---
    const subscription = RideService.subscribeToRide(activeRide.id, async (updatedRide) => {
        const newStatus = updatedRide.status;
        const driverId = updatedRide.driver_id;
        
        if (newStatus === RideStatus.ACCEPTED && driverId) {
            setSearchState('FOUND');
            
            // Fetch REAL Driver Details from DB
            try {
                const { data: driverProfile, error } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', driverId)
                  .single();

                if (error || !driverProfile) {
                    console.error("Could not fetch driver details", error);
                    // Fallback if fetch fails but ride is accepted
                    setActiveRide({
                        ...activeRide,
                        status: RideStatus.ACCEPTED,
                        driver: {
                            id: driverId,
                            name: 'Verified Driver',
                            vehicle: 'Vehicle',
                            plate: '...',
                            phone: '',
                            rating: 5.0
                        }
                    });
                } else {
                    setActiveRide({
                        ...activeRide,
                        status: RideStatus.ACCEPTED,
                        driver: {
                            id: driverProfile.id,
                            name: driverProfile.full_name || 'Driver',
                            vehicle: driverProfile.vehicle_type || 'Vehicle',
                            plate: 'SA 123', // In prod, store plate in profiles or vehicle table
                            phone: driverProfile.phone || '',
                            rating: driverProfile.rating || 5.0
                        }
                    });
                }
            } catch (e) {
                console.error("Driver fetch error", e);
            }
        }
    });

    // Timeout fallback (if no driver accepts in 3 mins)
    const timeout = setTimeout(() => {
        if (searchState === 'SEARCHING') {
            setSearchState('FAILED');
        }
    }, 180000); 

    return () => {
        subscription.unsubscribe();
        clearTimeout(timeout);
    };
  }, [activeRide, setView, setActiveRide]);

  const handleRetry = () => {
      setSearchState('SEARCHING');
  };

  const handleCancel = async () => {
      // Try to cancel in DB, but proceed locally regardless
      if (activeRide?.id) {
        try {
            await supabase.from('rides').update({ status: 'CANCELLED' }).eq('id', activeRide.id);
        } catch (e) {
            console.warn("Could not cancel on server, cancelling locally.");
        }
      }
      setActiveRide(null);
      setView(AppView.HOME);
  };

  const handleGoToTracking = () => {
      setView(AppView.TRACKING);
  }

  const getRoleTitle = () => {
      if (activeRide?.type === 'move') return 'Mover';
      if (activeRide?.type === 'errand') return 'Runner';
      return 'Driver';
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background-light px-6 relative overflow-hidden">
      
      {searchState === 'SEARCHING' && (
          <>
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <div className="w-64 h-64 bg-primary/10 rounded-full animate-pulse-slow"></div>
                <div className="absolute w-96 h-96 bg-primary/5 rounded-full animate-pulse-slow animation-delay-500"></div>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-white rounded-full shadow-glow flex items-center justify-center mb-8 relative">
                <span className="material-symbols-rounded text-5xl text-primary animate-bounce">search</span>
                <div className="absolute -bottom-2 w-12 h-2 bg-black/10 rounded-[100%] blur-sm"></div>
                </div>

                <h2 className="text-3xl font-extrabold text-text-main mb-2">Finding a {getRoleTitle()}</h2>
                <p className="text-text-sub font-medium">Connecting you with nearby {getRoleTitle().toLowerCase()}s in your area...</p>
                <p className="text-xs text-gray-400 mt-4">(Waiting for acceptance...)</p>
            </div>
          </>
      )}

      {searchState === 'FOUND' && (
           <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center px-6 animate-fade-in">
                {/* Provider Found Alert Card */}
                <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-visible flex flex-col items-center p-6 pt-10 relative animate-slide-up ring-1 ring-white/10">
                    {/* Success Icon Header */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-teal rounded-full p-4 shadow-xl border-4 border-white">
                        <span className="material-symbols-rounded text-slate-900 text-4xl font-black">check</span>
                    </div>
                    
                    <div className="text-center mb-6">
                        <h1 className="text-slate-900 text-2xl font-black leading-tight tracking-tight uppercase">Runner Found!</h1>
                        <p className="text-slate-400 mt-1 text-xs font-bold uppercase tracking-widest">Your request was accepted.</p>
                    </div>

                    {/* Provider Profile Info */}
                    <div className="w-full bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl overflow-hidden border-2 border-white shadow-sm">
                                <img src={`https://i.pravatar.cc/100?u=${activeRide?.driver?.id}`} alt="Driver" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-black text-slate-900 truncate">{activeRide?.driver?.name || 'Partner'}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="flex items-center gap-1 bg-brand-teal/10 px-2 py-0.5 rounded-full">
                                        <span className="material-symbols-rounded text-brand-teal text-xs fill-icon">star</span>
                                        <span className="text-brand-teal font-black text-[10px]">{activeRide?.driver?.rating || '5.0'}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeRide?.driver?.vehicle}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Plate</p>
                            <p className="text-xs font-black text-slate-900 leading-none">{activeRide?.driver?.plate || 'SA 123'}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Arrival</p>
                            <p className="text-xs font-black text-slate-900 leading-none">~4 min</p>
                        </div>
                    </div>

                    <button 
                        onClick={handleGoToTracking}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-slate-200 text-base uppercase tracking-widest"
                    >
                        Start Tracking
                    </button>
                </div>
           </div>
      )}

      {searchState === 'FAILED' && (
           <div className="relative z-10 flex flex-col items-center text-center animate-slide-up w-full max-w-sm">
                <div className="w-24 h-24 bg-red-50 rounded-full shadow-sm flex items-center justify-center mb-8">
                    <span className="material-symbols-rounded text-5xl text-red-500">sentiment_dissatisfied</span>
                </div>
                <h2 className="text-2xl font-extrabold text-text-main mb-2">No {getRoleTitle()}s Nearby</h2>
                <p className="text-text-sub font-medium mb-8">All our {getRoleTitle().toLowerCase()}s are currently busy. Please try again in a few minutes.</p>
                
                <div className="w-full space-y-3">
                    <Button fullWidth onClick={handleRetry}>Try Again</Button>
                    <button 
                        onClick={handleCancel}
                        className="w-full h-12 rounded-full border border-gray-200 text-gray-500 font-bold hover:bg-gray-50"
                    >
                        Cancel Request
                    </button>
                </div>
           </div>
      )}

      {searchState === 'SEARCHING' && (
        <div className="absolute bottom-[calc(3rem+var(--safe-area-bottom))] w-full px-6 z-20">
            <button 
            onClick={handleCancel}
            className="w-full h-12 rounded-full border-2 border-gray-200 text-text-sub font-bold hover:bg-gray-50 transition-colors bg-white/80 backdrop-blur-sm"
            >
            Cancel
            </button>
        </div>
      )}
    </div>
  );
};
