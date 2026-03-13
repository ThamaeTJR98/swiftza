
import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppView, UserRole } from './types';
import { Onboarding } from './views/Onboarding';
import { Login } from './views/Login';
import { Register } from './views/Register';
import { Home } from './views/Home';
import { DriverHome } from './views/DriverHome';
import { RequestRide } from './views/RequestRide';
import { FindingRunner } from './views/FindingRunner';
import { Tracking } from './views/Tracking';
import { DriverWallet } from './views/DriverWallet'; 
import { CreatorWallet } from './views/CreatorWallet';   
import { Profile } from './views/Profile';
import { Chat } from './views/Chat'; 
import { POPIAConsent } from './components/POPIAConsent';
import { PrivacyPolicy } from './views/PrivacyPolicy';
import { CookiePolicy } from './views/CookiePolicy';
import { TermsOfService } from './views/TermsOfService';
import { SavedPlaces } from './views/SavedPlaces';
import { RideComplete } from './views/RideComplete';
import { AdminDashboard } from './views/AdminDashboard';
import { BottomNav } from './components/BottomNav';
import { MapViz } from './components/MapViz';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatus } from './components/NetworkStatus';
import { NotificationService } from './services/NotificationService';
import { HelpSupport } from './components/profile/HelpSupport';

const LoadingScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center w-full h-full min-h-[100dvh] bg-slate-900 z-50 relative">
    <div className="pulsing-dot scale-150"></div>
    <p className="mt-6 text-brand-teal font-bold animate-pulse text-sm tracking-widest uppercase">Initializing SwiftZA...</p>
  </div>
);

const MainApp: React.FC = () => {
  const { view, setView, user, selectedJob, activeRide } = useApp();

  // Initialize Notifications when user logs in
  useEffect(() => {
    if (user) {
      // Small delay to ensure UI is settled before prompting
      const timer = setTimeout(() => {
        NotificationService.requestPermission();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  // Route Guarding
  useEffect(() => {
    const publicViews = [AppView.ONBOARDING, AppView.LOGIN, AppView.REGISTER, AppView.POPIA_CONSENT, AppView.PRIVACY_POLICY, AppView.COOKIE_POLICY, AppView.TERMS_OF_SERVICE];
    // If we are on a protected view but have no user, redirect to login
    // We add a small delay to allow session restoration to happen first
    if (!user && !publicViews.includes(view)) {
        const timer = setTimeout(() => {
            // Double check user is still null before redirecting
            setView(AppView.ONBOARDING);
        }, 1000); // Give it 1s to restore session
        return () => clearTimeout(timer);
    }
  }, [user, view, setView]);

  const showBottomNav = [
    AppView.HOME, 
    AppView.DRIVER_HOME,
    AppView.WALLET, 
    AppView.PROFILE
  ].includes(view) && !selectedJob && !activeRide;

  const isAuthScreen = [AppView.ONBOARDING, AppView.LOGIN, AppView.REGISTER, AppView.POPIA_CONSENT, AppView.PRIVACY_POLICY].includes(view);
  const isChatScreen = view === AppView.CHAT;
  const isRideComplete = view === AppView.RIDE_COMPLETE;
  const isAdmin = view === AppView.ADMIN;
  const isHelpSupport = view === AppView.HELP_SUPPORT;
  const isWallet = view === AppView.WALLET;
  const isProfile = view === AppView.PROFILE;
  const isPrivacyPolicy = view === AppView.PRIVACY_POLICY;
  const isCookiePolicy = view === AppView.COOKIE_POLICY;
  const isTermsOfService = view === AppView.TERMS_OF_SERVICE;
  const isSavedPlaces = view === AppView.SAVED_PLACES;

  // Views that should have a solid background (not transparent to map)
  const isSolidView = isAuthScreen || isChatScreen || isRideComplete || isAdmin || isHelpSupport || isWallet || isProfile || isPrivacyPolicy || isCookiePolicy || isTermsOfService || isSavedPlaces;

  const isProtectedView = ![AppView.ONBOARDING, AppView.LOGIN, AppView.REGISTER, AppView.POPIA_CONSENT, AppView.PRIVACY_POLICY, AppView.COOKIE_POLICY, AppView.TERMS_OF_SERVICE].includes(view);
  
  // Instead of returning null (whitespace), show loading screen while checking auth
  if (isProtectedView && !user) {
      return <LoadingScreen />;
  } 

  return (
    <div className="w-full h-full min-h-[100dvh] relative overflow-hidden font-sans text-text-main bg-slate-100">
      <NetworkStatus />
      
      {/* Map layer stays fixed at the back */}
      {!isAuthScreen && !isChatScreen && !isRideComplete && !isAdmin && !isHelpSupport && <MapViz isGlobal={true} />}

      <main className={`relative z-10 w-full h-full pointer-events-none ${isSolidView ? 'bg-background-light pointer-events-auto' : 'bg-transparent'}`}>
        
        {/* Full Screen Solid Views */}
        <div className={`w-full h-full ${isSolidView ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            {view === AppView.ONBOARDING && <Onboarding setView={setView} />}
            {view === AppView.PRIVACY_POLICY && <PrivacyPolicy />}
            {view === AppView.COOKIE_POLICY && <CookiePolicy />}
            {view === AppView.TERMS_OF_SERVICE && <TermsOfService />}
            {view === AppView.SAVED_PLACES && <SavedPlaces />}
            {view === AppView.LOGIN && <Login />}
            {view === AppView.REGISTER && <Register />}
            {view === AppView.WALLET && (user?.role === UserRole.DRIVER ? <DriverWallet /> : <CreatorWallet />)}
            {view === AppView.PROFILE && <Profile />}
            {view === AppView.CHAT && <Chat />} 
            {view === AppView.RIDE_COMPLETE && <RideComplete />}
            {view === AppView.ADMIN && <AdminDashboard />}
            {view === AppView.HELP_SUPPORT && user && (
                <HelpSupport 
                    role={user.role === UserRole.DRIVER ? 'DRIVER' : 'CREATOR'} 
                    onBack={() => setView(AppView.PROFILE)} 
                />
            )}
        </div>

        {/* Map Overlays (Transparent backgrounds) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            {view === AppView.HOME && <Home />}
            {view === AppView.DRIVER_HOME && <DriverHome />}
            {view === AppView.REQUEST_RIDE && <RequestRide />}
            {view === AppView.FINDING_RUNNER && <FindingRunner />}
            {view === AppView.TRACKING && <Tracking />}
        </div>
      </main>

      {showBottomNav && user && user.role !== UserRole.ADMIN && (
        <BottomNav 
            currentView={view} 
            setView={setView} 
            userRole={user.role}
        />
      )}

      {/* Global Overlays */}
      <POPIAConsent />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
