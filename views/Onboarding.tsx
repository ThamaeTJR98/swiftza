import React, { useState, useEffect, useCallback } from 'react';
import { AppView, UserRole } from '../types';
import { useApp } from '../context/AppContext';

interface OnboardingProps {
  setView: (view: AppView) => void;
}

// No longer needed, will be fetched from API
// const MOCK_JOBS = [...]

export const Onboarding: React.FC<OnboardingProps> = ({ setView }) => {
  const [step, setStep] = useState<'LANDING' | 'CREATOR_INTRO' | 'DRIVER_INTRO'>('LANDING');
  const { setView: setGlobalView, setRegistrationRole } = useApp(); 
  
  const [visibleJobs, setVisibleJobs] = useState<any[]>([]);
  const [showNewJobToast, setShowNewJobToast] = useState(false);
  const [interactionMsg, setInteractionMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      // In a real app, you'd get the user's location first
      // const position = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      // const { latitude, longitude } = position.coords;
      // const response = await fetch(`/api/public/jobs?lat=${latitude}&lng=${longitude}`);
      
      // For this demo, we'll call it without location
      const response = await fetch('/api/public/jobs');
      const data = await response.json();

      setVisibleJobs(prevJobs => {
        const newJobs = data.filter((job: any) => !prevJobs.some(p => p.id === job.id));
        if (newJobs.length > 0 && prevJobs.length > 0) {
            setShowNewJobToast(true);
            setTimeout(() => setShowNewJobToast(false), 3000);
        }
        return data;
      });

    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      // Optionally, set an error state to show in the UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Live Feed Logic
  useEffect(() => {
    if (step === 'DRIVER_INTRO') {
      setIsLoading(true);
      fetchJobs(); // Initial fetch
      const interval = setInterval(fetchJobs, 20000); // Poll every 20 seconds

      return () => {
          clearInterval(interval);
      };
    } else {
        setVisibleJobs([]); 
    }
  }, [step, fetchJobs]);

  const handleLogin = () => {
    setGlobalView(AppView.LOGIN);
  };

  const handleSignUp = (role: UserRole) => {
    setRegistrationRole(role);
    setGlobalView(AppView.POPIA_CONSENT); 
  };
  
  const handleViewJob = () => {
      setInteractionMsg("🔒 Sign Up to view details");
      setTimeout(() => setInteractionMsg(null), 2000);
  };

  // --- STEP 1: Main Landing ---
  if (step === 'LANDING') {
    return (
      <div className="relative w-full min-h-[100dvh] bg-surface-white flex flex-col justify-between overflow-hidden font-display">
         {/* Enhanced Background Gradient Layer */}
         <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-teal-50 via-white to-yellow-50 opacity-100 pointer-events-none"></div>
         
         {/* Animated Ambient Blobs */}
         <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[50%] rounded-full bg-brand-teal/20 blur-[120px] animate-pulse-slow"></div>
         <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[50%] rounded-full bg-brand-gold/30 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

         {/* Main Content Container with safe area padding */}
         <div className="relative z-10 flex flex-col h-full p-6 pt-safe-top pb-6">
            
            {/* Header Section */}
            <div className="flex flex-col items-center pt-12 text-center space-y-6 mt-auto mb-10">
                 {/* Logo Icon with Enhanced Animation */}
                 <div className="relative animate-float">
                    <div className="absolute inset-0 bg-brand-gold/40 blur-2xl rounded-full scale-125 animate-pulse"></div>
                    <div className="relative bg-white text-white w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-teal/40 transform -rotate-3 hover:rotate-0 transition-transform duration-500 ring-4 ring-white/30 overflow-hidden">
                        <img 
                            src="/logo.png" 
                            alt="SwiftZA Logo" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback to icon if image fails to load
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    const icon = document.createElement('span');
                                    icon.className = 'material-icons-round text-5xl text-brand-teal';
                                    icon.innerText = 'directions_car';
                                    parent.appendChild(icon);
                                }
                            }}
                        />
                    </div>
                    {/* SA Flag Dot */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-gold border-4 border-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-[10px]">🇿🇦</span>
                    </div>
                 </div>
                 
                 <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight drop-shadow-sm">
                        Swift<span className="text-brand-teal">ZA</span>
                    </h1>
                    <p className="text-slate-600 text-sm max-w-[280px] mx-auto leading-relaxed font-semibold">
                        The app that moves Mzansi. Quick errands and Movers for everyone.
                    </p>
                 </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 w-full mt-auto mb-4">
                <button 
                    onClick={() => setStep('CREATOR_INTRO')}
                    className="group w-full relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-1 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-12px_rgba(0,196,180,0.2)] transition-all duration-300 border border-white active:scale-[0.98] ring-1 ring-black/5"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center p-3.5">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-teal flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                            <span className="material-icons-round text-2xl">add_task</span>
                        </div>
                        <div className="ml-4 text-left flex-1">
                            <h3 className="text-base font-extrabold text-gray-900 group-hover:text-brand-teal transition-colors">I need a Service</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">Short Left, Errands, or Moves.</p>
                        </div>
                        <div className="text-gray-300 group-hover:text-brand-teal transition-colors bg-gray-50 rounded-full p-1">
                            <span className="material-icons-round">chevron_right</span>
                        </div>
                    </div>
                </button>

                <button 
                    onClick={() => setStep('DRIVER_INTRO')}
                    className="group w-full relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-1 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-12px_rgba(253,184,19,0.3)] transition-all duration-300 border border-white active:scale-[0.98] ring-1 ring-black/5"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center p-3.5">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-gold flex items-center justify-center text-slate-900 shadow-md group-hover:scale-110 transition-transform duration-300">
                            <span className="material-icons-round text-2xl">work</span>
                        </div>
                        <div className="ml-4 text-left flex-1">
                            <h3 className="text-base font-extrabold text-gray-900 group-hover:text-yellow-600 transition-colors">I want to Earn</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium leading-tight">Drive or run errands for cash.</p>
                        </div>
                        <div className="text-gray-300 group-hover:text-yellow-500 transition-colors bg-gray-50 rounded-full p-1">
                            <span className="material-icons-round">chevron_right</span>
                        </div>
                    </div>
                </button>
            </div>

            {/* Footer */}
            <div className="mt-2 flex flex-col items-center space-y-4 pb-safe">
                 <div className="flex items-center space-x-1 text-xs bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                    <span className="text-slate-500 font-medium">Already local?</span>
                    <button onClick={handleLogin} className="text-brand-teal font-extrabold hover:underline">Log in</button>
                </div>
                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/40 text-[10px] font-bold text-slate-400 border border-white/50 backdrop-blur-sm">
                    <span className="material-icons-round text-[12px]">public</span>
                    <span>South Africa</span>
                </div>
            </div>

         </div>
      </div>
    );
  }

  // --- STEP 2: Creator Onboarding ---
  if (step === 'CREATOR_INTRO') {
    return (
      <div className="w-full h-full min-h-[100dvh] bg-brand-teal flex flex-col font-display relative overflow-hidden">
        <div className="h-safe-top w-full shrink-0"></div>
        
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 text-white text-center min-h-0 py-4">
            <div className="absolute top-4 left-4 z-20">
                <button onClick={() => setStep('LANDING')} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition backdrop-blur-md">
                    <span className="material-icons text-white">arrow_back</span>
                </button>
            </div>

            <div className="absolute top-1/4 left-4 opacity-10 transform -rotate-12 pointer-events-none">
                <span className="material-icons text-8xl">directions_run</span>
            </div>
            <div className="absolute top-1/3 right-6 opacity-10 transform rotate-12 pointer-events-none">
                <span className="material-icons text-7xl">local_shipping</span>
            </div>
            
            <div className="bg-white/10 rounded-full p-4 mb-4 backdrop-blur-sm border border-white/20 shadow-lg relative shrink-0">
                <div className="bg-white rounded-full p-3 shadow-inner flex items-center justify-center h-16 w-16 relative">
                     <span className="material-icons text-brand-teal text-3xl">add_task</span>
                </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-2 tracking-tight">One App, Many Solutions</h1>
            <p className="text-teal-50 text-xs leading-relaxed max-w-[280px] mb-6 px-2">
                Connect with verified runners & drivers in your area. Safe, simple, sharp.
            </p>
        </div>

        <div className="bg-gray-50 w-full rounded-t-[32px] p-6 pb-safe flex flex-col gap-4 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] shrink-0">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto absolute top-3 left-1/2 transform -translate-x-1/2 opacity-50"></div>
            
            <div className="flex flex-col gap-3 mt-1">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-rounded text-lg">directions_run</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Personal Shopping</h3>
                        <p className="text-[10px] text-gray-500">Groceries from Woolies, Pick n Pay, etc.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-rounded text-lg">inventory_2</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Package Delivery</h3>
                        <p className="text-[10px] text-gray-500">Send items across town safely.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="material-symbols-rounded text-lg">local_shipping</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Request Movers</h3>
                        <p className="text-[10px] text-gray-500">Book a bakkie and helpers for your move.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 pt-1">
                <button 
                    onClick={() => handleSignUp(UserRole.CREATOR)}
                    className="w-full bg-brand-teal text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-teal-500/30 active:scale-95 transition-transform flex items-center justify-center space-x-2"
                >
                    <span>Create Account</span>
                    <span className="material-icons text-sm">arrow_forward</span>
                </button>
                
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Already have an account? 
                        <button onClick={handleLogin} className="text-brand-teal font-semibold hover:underline ml-1">Log in</button>
                    </p>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- STEP 3: Driver Onboarding ---
  if (step === 'DRIVER_INTRO') {
    return (
      <div className="w-full h-full min-h-[100dvh] bg-slate-900 flex flex-col font-display relative overflow-hidden transition-colors duration-300">
        
        {interactionMsg && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-brand-gold text-slate-900 px-5 py-2.5 rounded-full text-xs font-bold shadow-xl z-50 animate-bounce flex items-center gap-2">
                {interactionMsg}
            </div>
        )}

        <div className="absolute top-4 left-4 z-20">
            <button onClick={() => setStep('LANDING')} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition backdrop-blur-md">
                <span className="material-icons text-white">arrow_back</span>
            </button>
        </div>

        <div className="flex-1 flex flex-col items-center pt-safe-top px-6 pb-6 relative z-10 text-center">
            <div className="mb-6 mt-8">
                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Make Money Mzansi</h1>
                <p className="text-slate-300 text-xs leading-relaxed max-w-[260px] mx-auto">
                    Turn your car, bike, or bakkie into cash. Start runs in your local area today.
                </p>
            </div>
            
            <div className="flex space-x-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold"></div>
            </div>

            <div className="mb-6 w-full flex justify-center space-x-3">
                 <button 
                    onClick={() => handleSignUp(UserRole.DRIVER)}
                    className="bg-brand-gold text-slate-900 font-bold py-3 px-6 rounded-xl shadow-lg hover:bg-yellow-400 transition-transform transform active:scale-95 text-sm"
                >
                    Sign Up Now
                </button>
                <button 
                    onClick={handleLogin}
                    className="bg-transparent border-2 border-white/30 text-white font-bold py-3 px-6 rounded-xl hover:bg-white/10 transition-transform transform active:scale-95 text-sm"
                >
                    Log In
                </button>
            </div>

            <div className="w-full flex-1 bg-gray-50 rounded-t-3xl shadow-soft overflow-hidden flex flex-col relative animate-slide-up pb-safe">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <span className="material-icons-round text-gray-400">filter_list</span>
                    <h2 className="font-bold text-gray-800 text-sm">Jobs Near You</h2>
                    <div className="w-6"></div> 
                </div>
                <div className="overflow-y-auto flex-1 p-3 space-y-3 no-scrollbar bg-gray-50 relative">
                    
                    <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 bg-brand-teal text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg transition-all duration-500 z-10 ${showNewJobToast ? 'translate-y-2 opacity-100' : '-translate-y-10 opacity-0'}`}>
                        New job found!
                    </div>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400 animate-fade-in pt-4">
                            <div className="relative mb-2">
                                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center relative z-10">
                                    <span className="material-icons-round text-2xl text-gray-500">radar</span>
                                </div>
                                <div className="absolute inset-0 bg-brand-teal/20 rounded-full animate-ping"></div>
                            </div>
                            <p className="text-xs font-bold text-gray-500">Scanning for nearby runs...</p>
                            <p className="text-[9px] text-gray-400 mt-1">We'll notify you when a job appears.</p>
                        </div>
                    )}

                    {!isLoading && visibleJobs.length === 0 && (
                         <div className="flex flex-col items-center justify-center h-48 text-gray-400 animate-fade-in pt-4">
                            <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center relative z-10">
                                <span className="material-icons-round text-2xl text-gray-500">explore_off</span>
                            </div>
                            <p className="text-xs font-bold text-gray-500 mt-2">No jobs in your area right now</p>
                            <p className="text-[9px] text-gray-400 mt-1">Check back soon!</p>
                        </div>
                    )}

                    {visibleJobs.map((job, index) => (
                        <div 
                            key={`${job.id}-${index}`}
                            className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 transition-all duration-500 
                                ${index === 0 && showNewJobToast ? 'transform scale-[1.02] border-brand-teal/30 shadow-md ring-2 ring-brand-teal/10' : ''}
                            `}
                        >
                            <div className="flex items-start">
                                <div className="flex flex-col items-center mr-3 mt-1 h-full">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                                    <div className="w-0.5 h-6 bg-gray-200 my-0.5"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-teal"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <h3 className={`font-semibold text-xs ${job.color}`}>{job.type}</h3>
                                        <span className="bg-gray-100 text-[10px] px-1.5 py-0.5 rounded text-gray-500">{job.distance}</span>
                                    </div>
                                    <div className="space-y-0.5 mt-1">
                                        <p className="text-xs font-medium text-gray-700">{job.title}</p>
                                        {job.location && <p className="text-[9px] text-gray-400">{job.location}</p>}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-1.5">
                                        <div className="flex items-center text-gray-500 text-[10px]">
                                            <span className="material-icons-round text-xs mr-1">payment</span>
                                            <span>{job.price}</span>
                                        </div>
                                        <button 
                                            onClick={handleViewJob}
                                            className="text-[10px] font-bold text-brand-teal px-2 py-0.5 rounded hover:bg-brand-teal/10 transition-colors"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="absolute top-20 right-[-20px] opacity-10 pointer-events-none">
            <span className="material-icons-round text-9xl text-white transform rotate-12">directions_run</span>
        </div>
        <div className="absolute top-40 left-[-30px] opacity-10 pointer-events-none">
            <span className="material-icons-round text-8xl text-white transform -rotate-12">local_taxi</span>
        </div>
      </div>
    );
  }

  return null;
};