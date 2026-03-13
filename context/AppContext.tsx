import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppView, UserRole, RideRequest, RideStatus, User, RideHistoryItem, TransactionType, ErrandCategory, RunnerLocation, SavedPlace, RunnerMode } from '../types';
import { supabase } from '../lib/supabase';
import { RideService } from '../services/RideService';
import { LocationService } from '../services/LocationService';
import { SavedPlacesService } from '../services/SavedPlacesService';

interface AppState {
  view: AppView;
  navigate: (view: AppView, clearHistory?: boolean) => void;
  goBack: () => void;
  canGoBack: boolean;
  user: User | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, phone: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateUserProfile: (profileData: any) => Promise<void>;
  activeRide: RideRequest | null;
  setActiveRide: (ride: RideRequest | null) => void;
  updateRideStatus: (status: RideStatus, data?: any) => void;
  completeRide: () => Promise<void>;
  toggleDutyStatus: (status: boolean) => Promise<void>;
  serviceType: 'ride' | 'errand' | 'move';
  setServiceType: (type: 'ride' | 'errand' | 'move') => void;
  errandCategory: ErrandCategory;
  setErrandCategory: (category: ErrandCategory) => void;
  registrationRole: UserRole;
  setRegistrationRole: (role: UserRole) => void;
  selectedHistoryItem: RideHistoryItem | null;
  setSelectedHistoryItem: (item: RideHistoryItem | null) => void;
  setView: (view: AppView) => void;
  initialRequestQuery: string;
  setInitialRequestQuery: (query: string) => void;
  availableJobs: RideRequest[];
  setAvailableJobs: React.Dispatch<React.SetStateAction<RideRequest[]>>;
  selectedJob: RideRequest | null;
  setSelectedJob: (job: RideRequest | null) => void;
  selectedRunner: RunnerLocation | null;
  setSelectedRunner: (runner: RunnerLocation | null) => void;
  nearbyRunners: Record<string, RunnerLocation>;
  isMapReady: boolean;
  setIsMapReady: (ready: boolean) => void;
  savedPlaces: SavedPlace[];
  addSavedPlace: (place: Omit<SavedPlace, 'id' | 'user_id'>) => Promise<void>;
  updateSavedPlace: (id: string, updates: Partial<SavedPlace>) => Promise<void>;
  deleteSavedPlace: (id: string) => Promise<void>;
  initialPickup: { address: string; lat: number; lng: number } | null;
  setInitialPickup: (location: { address: string; lat: number; lng: number } | null) => void;
  initialDropoff: { address: string; lat: number; lng: number } | null;
  setInitialDropoff: (location: { address: string; lat: number; lng: number } | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const STORAGE_KEYS = {
  VIEW: 'swiftza_view',
  SERVICE_TYPE: 'swiftza_service_type',
  ACTIVE_RIDE_ID: 'swiftza_active_ride_id',
  USER_SESSION: 'swiftza_user_session' 
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [view, setInternalView] = useState<AppView>(AppView.ONBOARDING);

  const [user, setUser] = useState<User | null>(null);
  const [activeRide, setActiveRideState] = useState<RideRequest | null>(null);
  const [initialRequestQuery, setInitialRequestQuery] = useState('');
  const [availableJobs, setAvailableJobs] = useState<RideRequest[]>([]);
  const [selectedJob, setSelectedJob] = useState<RideRequest | null>(null);
  const [selectedRunner, setSelectedRunner] = useState<RunnerLocation | null>(null);
  const [nearbyRunners, setNearbyRunners] = useState<Record<string, RunnerLocation>>({});
  const [isMapReady, setIsMapReady] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [initialPickup, setInitialPickup] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [initialDropoff, setInitialDropoff] = useState<{ address: string; lat: number; lng: number } | null>(null);

  // --- ONESIGNAL PUSH NOTIFICATIONS ---
  useEffect(() => {
    const initOneSignal = async () => {
      // @ts-ignore
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
      if (!appId || typeof window === 'undefined') return;

      try {
        // @ts-ignore
        const OneSignal = window.OneSignal || [];
        await OneSignal.init({
          appId: appId,
          allowLocalhostAsSecureOrigin: true,
        });

        // If user is logged in, register their token
        if (user?.id) {
          const externalId = await OneSignal.getExternalUserId();
          if (externalId !== user.id) {
            await OneSignal.setExternalUserId(user.id);
          }
          
          // Get push token and save to profile
          const pushToken = await OneSignal.getPushToken();
          if (pushToken && user.id) {
            await supabase.from('profiles').update({ fcm_token: pushToken }).eq('id', user.id);
          }
        }
      } catch (err) {
        console.error("OneSignal Init Error:", err);
      }
    };

    initOneSignal();
  }, [user?.id]);

  const setActiveRide = (ride: RideRequest | null) => {
      setActiveRideState(ride);
      if (ride) {
          localStorage.setItem(STORAGE_KEYS.ACTIVE_RIDE_ID, ride.id);
      } else {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_RIDE_ID);
      }
  };

  const [serviceType, setServiceTypeState] = useState<'ride' | 'errand' | 'move'>(() => {
     const saved = localStorage.getItem(STORAGE_KEYS.SERVICE_TYPE);
     return (saved as 'ride' | 'errand' | 'move') || 'errand';
  });

  const [errandCategory, setErrandCategory] = useState<ErrandCategory>(ErrandCategory.GROCERY_SHOPPING);

  const [registrationRole, setRegistrationRole] = useState<UserRole>(UserRole.CREATOR);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<RideHistoryItem | null>(null);

  useEffect(() => {
      const savedRideId = localStorage.getItem(STORAGE_KEYS.ACTIVE_RIDE_ID);
      if (savedRideId && !activeRide) {
          supabase.from('rides').select('*').eq('id', savedRideId).single()
          .then(({ data, error }) => {
              if (data && !error && data.status !== 'COMPLETED' && data.status !== 'CANCELLED') {
                   const restoredRide: RideRequest = {
                       id: data.id,
                       type: data.type,
                       status: data.status,
                       price: data.price,
                       paymentMethod: data.payment_method,
                       pickup: { address: data.pickup_address, lat: data.pickup_lat, lng: data.pickup_lng },
                       dropoff: { address: data.dropoff_address, lat: data.dropoff_lat, lng: data.dropoff_lng },
                       distance: 'Restored',
                       otp: data.otp,
                       stops: data.stops || [],
                       currentStopIndex: data.current_stop_index || 0
                   };
                   setActiveRideState(restoredRide);
              } else {
                  localStorage.removeItem(STORAGE_KEYS.ACTIVE_RIDE_ID);
              }
          });
      }
      
      const storedSession = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
      if (storedSession && !user) {
          try {
              const parsedUser = JSON.parse(storedSession);
              setUser(parsedUser);
              // If we restored a user, we can safely navigate to their home
              if (parsedUser.role === UserRole.DRIVER) {
                  setInternalView(AppView.DRIVER_HOME);
              } else {
                  setInternalView(AppView.HOME);
              }
          } catch (e) {
              localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
          }
      }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncProfile(session.user.id);
      } else {
         const storedSession = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
         if (!storedSession) {
             setUser(null);
             setActiveRide(null);
             if (![AppView.LOGIN, AppView.ONBOARDING, AppView.REGISTER, AppView.POPIA_CONSENT].includes(view)) {
                navigate(AppView.LOGIN, true);
             }
         }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await syncProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
          setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
        if (event.state && event.state.view) {
            setInternalView(event.state.view);
        }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const syncProfile = async (userId: string) => {
      try {
          let { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
          
          if (error || !profile) {
             if(user && user.id === userId) return; 
             console.warn("Profile not found, waiting for creation...");
             return;
          }

          const documents = profile.documents_data || {};
          const settings = profile.settings_data || {};
          const preferences = { 
              locationSharing: settings.locationSharing ?? true, 
              personalizedAds: settings.personalizedAds ?? false 
          }; 

          // Fetch today's earnings for drivers
          let todaysEarnings = 0;
          if (profile.role === UserRole.DRIVER) {
              const startOfToday = new Date();
              startOfToday.setHours(0, 0, 0, 0);
              
              const { data: earningsData } = await supabase
                  .from('ledger')
                  .select('amount')
                  .eq('profile_id', userId)
                  .eq('type', TransactionType.TRIP_EARNING)
                  .gte('created_at', startOfToday.toISOString());
              
              if (earningsData) {
                  todaysEarnings = earningsData.reduce((sum, entry) => sum + (entry.amount || 0), 0);
              }
          }

          const appUser: User = {
              id: userId,
              name: profile.full_name || 'User',
              phone: profile.phone || '',
              email: (await supabase.auth.getUser()).data.user?.email || '',
              role: profile.role as UserRole,
              rating: profile.rating || 5.0,
              isVerified: profile.is_verified,
              isOnline: true, // Force Online on load as requested
              isDemo: false, 
              profileUrl: profile.avatar_url, 
              kycStatus: profile.kyc_status || 'PENDING',
              complianceStatus: profile.compliance_status as any,
              prdpExpiry: profile.prdp_expiry,
              operatingLicenseNo: profile.operating_license_no,
              documentStatus: {
                  license: documents.license || 'MISSING',
                  prdp: documents.prdp || 'MISSING'
              },
              wallet: {
                  balance: profile.wallet_balance || 0,
                  currency: 'ZAR',
                  ledger: [],
                  isPayoutEligible: (profile.wallet_balance || 0) > 300,
                  todaysEarnings: todaysEarnings
              },
              vehicleType: profile.vehicle_type,
              preferences: preferences,
              metadata: {
                  popia_consent: settings.popia_consent,
                  consent_date: settings.consent_date,
                  policy_version: settings.policy_version,
                  deletion_requested_at: settings.deletion_requested_at,
                  isOnline: true
              }
          };
          setUser(appUser);

          // Start tracking immediately if driver
          if (appUser.role === UserRole.DRIVER) {
              LocationService.startTracking(userId);
              // Also update DB to ensure consistency
              supabase.from('profiles').update({ 
                settings_data: { ...settings, isOnline: true } 
              }).eq('id', userId).then(({error}) => {
                if(error) console.error("Failed to sync online status to DB:", error);
              });
          }
          
          if ([AppView.LOGIN, AppView.ONBOARDING].includes(view)) {
              if (appUser.role === UserRole.DRIVER) navigate(AppView.DRIVER_HOME, true);
              else navigate(AppView.HOME, true);
          }
      } catch (err) { console.error("Profile Sync Error:", err); }
  };

  // --- CONNECTION MONITORING ---
  useEffect(() => {
    const handleOnline = () => {
        console.log("App is Online");
        if (user?.role === UserRole.DRIVER) {
            toggleDutyStatus(true);
        }
    };
    const handleOffline = () => {
        console.log("App is Offline");
        if (user?.role === UserRole.DRIVER) {
            toggleDutyStatus(false);
        }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id, user?.role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW, view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICE_TYPE, serviceType);
  }, [serviceType]);

  useEffect(() => {
    if (!user) return;

    // 1. Subscribe to Runner Locations (for Creators)
    const locationsChannel = supabase.channel('runner_locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_locations' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const loc = payload.new as any;
          setNearbyRunners(prev => ({
            ...prev,
            [loc.driver_id]: {
              driver_id: loc.driver_id,
              lat: loc.lat,
              lng: loc.lng,
              heading: loc.heading || 0,
              last_updated: loc.last_updated
            }
          }));
        } else if (payload.eventType === 'DELETE') {
          const loc = payload.old as any;
          setNearbyRunners(prev => {
            const next = { ...prev };
            delete next[loc.driver_id];
            return next;
          });
        }
      })
      .subscribe();

    // Initial Fetch
    const fetchInitialData = async () => {
      // Fetch Runners
      const { data: locations } = await supabase.from('driver_locations').select('*');
      if (locations) {
        const runnerMap: Record<string, RunnerLocation> = {};
        locations.forEach(loc => {
          runnerMap[loc.driver_id] = {
            driver_id: loc.driver_id,
            lat: loc.lat,
            lng: loc.lng,
            heading: loc.heading || 0,
            last_updated: loc.last_updated
          };
        });

        // Add mock runners for demo users
        if (user.isDemo && user.role === UserRole.CREATOR) {
            const addMocks = (baseLat: number, baseLng: number) => {
                runnerMap['mock-runner-1'] = {
                    driver_id: 'mock-runner-1',
                    lat: baseLat + 0.005,
                    lng: baseLng - 0.005,
                    heading: 45,
                    last_updated: new Date().toISOString(),
                    name: 'Sipho M.',
                    rating: 4.9,
                    mode: RunnerMode.MOTORBIKE
                };
                runnerMap['mock-runner-2'] = {
                    driver_id: 'mock-runner-2',
                    lat: baseLat - 0.008,
                    lng: baseLng + 0.002,
                    heading: 120,
                    last_updated: new Date().toISOString(),
                    name: 'Thabo K.',
                    rating: 4.7,
                    mode: RunnerMode.FOOT
                };
                runnerMap['mock-runner-3'] = {
                    driver_id: 'mock-runner-3',
                    lat: baseLat + 0.002,
                    lng: baseLng + 0.008,
                    heading: 210,
                    last_updated: new Date().toISOString(),
                    name: 'Lerato N.',
                    rating: 5.0,
                    mode: RunnerMode.CAR
                };
                setNearbyRunners({...runnerMap});
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => addMocks(pos.coords.latitude, pos.coords.longitude),
                    () => addMocks(-26.1076, 28.0567) // Fallback to Sandton
                );
            } else {
                addMocks(-26.1076, 28.0567);
            }
        } else {
            setNearbyRunners(runnerMap);
        }
      }
    };

    fetchInitialData();

    return () => {
      locationsChannel.unsubscribe();
    };
  }, [user?.id]);

  // --- ACTIVE RIDE SUBSCRIPTION ---
  useEffect(() => {
    if (!activeRide?.id) return;

    const channel = supabase.channel(`ride:${activeRide.id}`)
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'rides', 
            filter: `id=eq.${activeRide.id}` 
        }, async (payload) => {
            const updatedRide = payload.new as any;
            
            // If driver was just assigned, fetch their details
            let driverDetails = activeRide.driver;
            // Check if driver_id changed or if we don't have driver details yet
            if (updatedRide.driver_id && (!activeRide.driver || activeRide.driver.id !== updatedRide.driver_id)) {
                const { data: driverProfile } = await supabase
                    .from('profiles')
                    .select('full_name, phone, vehicle_type, rating, vehicles(plate, model, make)')
                    .eq('id', updatedRide.driver_id)
                    .single();
                
                if (driverProfile) {
                    const vehicle = driverProfile.vehicles?.[0] || {};
                    driverDetails = {
                        id: updatedRide.driver_id,
                        name: driverProfile.full_name,
                        vehicle: `${vehicle.make || ''} ${vehicle.model || ''}`.trim() || driverProfile.vehicle_type,
                        plate: vehicle.plate || 'NO PLATE',
                        phone: driverProfile.phone,
                        rating: driverProfile.rating
                    };
                }
            }

            const newRideState: RideRequest = {
                ...activeRide,
                status: updatedRide.status,
                driver: driverDetails,
                otp: updatedRide.otp,
                currentStopIndex: updatedRide.current_stop_index,
                stops: updatedRide.stops || activeRide.stops
            };
            
            setActiveRideState(newRideState);
        })
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [activeRide?.id, activeRide?.driver?.id]);

  useEffect(() => {
    if (user) {
      SavedPlacesService.getPlaces().then(setSavedPlaces).catch(console.error);
    }
  }, [user]);

  const addSavedPlace = async (place: Omit<SavedPlace, 'id' | 'user_id'>) => {
    const newPlace = await SavedPlacesService.addPlace(place);
    setSavedPlaces(prev => [...prev, newPlace]);
  };

  const updateSavedPlace = async (id: string, updates: Partial<SavedPlace>) => {
    const updatedPlace = await SavedPlacesService.updatePlace(id, updates);
    setSavedPlaces(prev => prev.map(p => p.id === id ? updatedPlace : p));
  };

  const deleteSavedPlace = async (id: string) => {
    await SavedPlacesService.deletePlace(id);
    setSavedPlaces(prev => prev.filter(p => p.id !== id));
  };

  const navigate = (newView: AppView, clearHistory = false) => {
    setInternalView(newView);
    if (clearHistory) {
      window.history.replaceState({ view: newView }, '');
    } else {
      window.history.pushState({ view: newView }, '');
    }
  };

  const goBack = () => {
    window.history.back();
  };

  const canGoBack = view !== AppView.HOME && view !== AppView.DRIVER_HOME && view !== AppView.LOGIN && view !== AppView.ONBOARDING;
  const setView = (newView: AppView) => navigate(newView);
  const setServiceType = (type: 'ride' | 'errand' | 'move') => setServiceTypeState(type);

  const signInWithEmail = async (email: string, password: string) => {
      if (email.toLowerCase().includes('demo')) {
          const isDriver = email.toLowerCase().includes('driver');
          const today = new Date().toISOString();
          
          const mockUser: User = {
              id: 'mock_user_demo',
              email,
              phone: '0820000000',
              name: 'Demo User',
              role: isDriver ? UserRole.DRIVER : UserRole.CREATOR,
              rating: 5.0,
              isDemo: true, 
              wallet: { 
                  balance: 450, 
                  currency: 'ZAR', 
                  ledger: isDriver ? [
                      { id: '1', date: today, description: 'Morning Ride to Sandton', amount: 80, type: TransactionType.TRIP_EARNING, balanceAfter: 450 },
                      { id: '2', date: today, description: 'Errand: Woolworths Food', amount: 120, type: TransactionType.TRIP_EARNING, balanceAfter: 370 },
                      { id: '3', date: today, description: 'Afternoon Short Left', amount: 65, type: TransactionType.TRIP_EARNING, balanceAfter: 250 }
                  ] : [], 
                  isPayoutEligible: true 
              },
              isVerified: true,
              isOnline: true,
              kycStatus: 'APPROVED',
              profileUrl: isDriver ? 'https://i.pravatar.cc/100?img=33' : 'https://i.pravatar.cc/100?img=11', 
              preferences: { locationSharing: true, personalizedAds: true }
          };
          setUser(mockUser);
          localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(mockUser));
          navigate(isDriver ? AppView.DRIVER_HOME : AppView.HOME, true);
          return;
      }

      try {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
      } catch (e: any) {
          const msg = e.message?.toLowerCase() || '';
          if (msg.includes('fetch') || msg.includes('network') || msg.includes('connection')) {
               const stored = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
               if (stored) {
                   const u = JSON.parse(stored);
                   if (u.email === email && !u.isDemo) { 
                       setUser(u);
                       navigate(u.role === UserRole.DRIVER ? AppView.DRIVER_HOME : AppView.HOME, true);
                       return;
                   }
               }
               alert("Network Error: Could not connect to SwiftZA servers. Please check your internet.");
               return; 
          }
          throw e; 
      }
  };

  const signUpWithEmail = async (email: string, password: string, phone: string, role: UserRole) => {
      try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;
          if (!data.user) throw new Error("Registration failed");

          const { error: profileError } = await supabase.from('profiles').insert({
              id: data.user.id,
              role: role,
              phone: phone,
              full_name: '',
              wallet_balance: 0,
              is_verified: false
          });

          if (profileError) console.error("Profile creation failed", profileError);
          setRegistrationRole(role);
      } catch (err: any) {
          const msg = err.message?.toLowerCase() || '';
          if (msg.includes('fetch') || msg.includes('network') || msg.includes('connection')) {
              const localId = 'local_' + Date.now();
              const localUser: User = {
                  id: localId,
                  email: email,
                  phone: phone,
                  role: role,
                  name: '',
                  rating: 5.0,
                  isDemo: false, 
                  wallet: { balance: 0, currency: 'ZAR', ledger: [], isPayoutEligible: false },
                  isVerified: false,
                  isOnline: true,
                  kycStatus: 'PENDING',
                  preferences: { locationSharing: true, personalizedAds: false }
              };
              
              setUser(localUser);
              localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(localUser));
              setRegistrationRole(role);
              return; 
          }
          throw err;
      }
  };

  const updateUserProfile = async (profileData: any) => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser) {
            await supabase.from('profiles').upsert({ id: authUser.id, ...profileData });
            await syncProfile(authUser.id);
        } else if (user) {
            const updatedUser = { 
                ...user, 
                ...profileData,
                name: profileData.full_name || user.name,
                isVerified: profileData.is_verified !== undefined ? profileData.is_verified : user.isVerified,
                kycStatus: profileData.kyc_status || user.kycStatus,
                profileUrl: profileData.avatar_url || user.profileUrl 
            };
            
            setUser(updatedUser);
            localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(updatedUser));
        } else {
            throw new Error("No User Session");
        }
      } catch (e: any) {
          if (user) {
              const updatedUser = { 
                  ...user, 
                  ...profileData,
                  name: profileData.full_name || user.name,
                  profileUrl: profileData.avatar_url || user.profileUrl
              };
              setUser(updatedUser);
              localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(updatedUser));
          } else {
              throw e;
          }
      }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    LocationService.stopTracking(); 
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_RIDE_ID);
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    setUser(null);
    navigate(AppView.ONBOARDING, true);
  };

  const updateUser = (updates: Partial<User>) => {
      if (user) { 
          const newUser = { ...user, ...updates };
          setUser(newUser);
          if (localStorage.getItem(STORAGE_KEYS.USER_SESSION)) {
              localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(newUser));
          }
      }
  };

  const updateRideStatus = (status: RideStatus, data?: any) => {
    if (activeRide) {
      if (status === RideStatus.CANCELLED) {
          setActiveRide(null);
          RideService.updateStatus(activeRide.id, status, data).catch(console.error);
          return;
      }

      let nextStopIndex = activeRide.currentStopIndex;
      let updatedStops = [...(activeRide.stops || [])];

      if (data?.stopCompleted) {
          if (updatedStops[activeRide.currentStopIndex]) {
              updatedStops[activeRide.currentStopIndex] = {
                  ...updatedStops[activeRide.currentStopIndex],
                  status: 'COMPLETED'
              };
          }
          nextStopIndex = (activeRide.currentStopIndex || 0) + 1;
      }

      const updatedRide = { 
          ...activeRide, 
          status, 
          currentStopIndex: nextStopIndex,
          stops: updatedStops,
          ...data,
          errandDetails: {
              ...(activeRide.errandDetails || {}),
              ...(data?.errandDetails || data || {})
          }
      };
      
      setActiveRide(updatedRide);
      RideService.updateStatus(activeRide.id, status, { ...data, currentStopIndex: nextStopIndex, stops: updatedStops }).catch(console.error);
    }
  };

  const completeRide = async () => {
    if (!activeRide || !user || user.role !== UserRole.DRIVER) return;
    try {
        await RideService.completeRide(activeRide.id);
        
        // Update local wallet for visual feedback
        const earnings = activeRide.price * 0.8;
        const newBalance = user.wallet.balance + earnings;
        const newTodaysEarnings = (user.wallet.todaysEarnings || 0) + earnings;
        const newEntry = {
            id: Date.now().toString(),
            rideId: activeRide.id,
            date: new Date().toISOString(),
            description: `Trip to ${activeRide.dropoff.address.split(',')[0]}`,
            type: TransactionType.TRIP_EARNING,
            amount: earnings,
            balanceAfter: newBalance
        };

        updateUser({
            wallet: {
                ...user.wallet,
                balance: newBalance,
                ledger: [newEntry, ...user.wallet.ledger],
                todaysEarnings: newTodaysEarnings
            }
        });

        setActiveRide(null); 
        navigate(AppView.RIDE_COMPLETE);
    } catch (e) {
        console.error("Failed to complete ride:", e);
    }
  };

  const toggleDutyStatus = async (status: boolean) => {
    if (!user) return;
    try {
      const settings = { ...(user.metadata || {}), isOnline: status };
      await supabase.from('profiles').update({ 
        settings_data: settings 
      }).eq('id', user.id);
      
      updateUser({ isOnline: status, metadata: settings });
      
      if (status) {
        LocationService.startTracking(user.id);
      } else {
        LocationService.stopTracking();
      }
    } catch (err) {
      console.error("Toggle Duty Status Error:", err);
    }
  };

  return (
    <AppContext.Provider value={{
      view, navigate, goBack, canGoBack, setView, user, logout,
      signInWithEmail, signUpWithEmail, 
      updateUser, updateUserProfile, activeRide, setActiveRide, updateRideStatus, completeRide,
      toggleDutyStatus,
      serviceType, setServiceType, errandCategory, setErrandCategory, registrationRole, setRegistrationRole,
      selectedHistoryItem, setSelectedHistoryItem,
      initialRequestQuery, setInitialRequestQuery,
      availableJobs, setAvailableJobs,
      selectedJob, setSelectedJob,
      selectedRunner, setSelectedRunner,
      nearbyRunners,
      isMapReady, setIsMapReady,
      savedPlaces, addSavedPlace, updateSavedPlace, deleteSavedPlace,
      initialPickup, setInitialPickup,
      initialDropoff, setInitialDropoff
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};