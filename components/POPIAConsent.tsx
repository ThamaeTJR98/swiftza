import React, { useState } from 'react';
import { Icon } from './Icons';
import { PrivacyService } from '../services/PrivacyService';
import { useApp } from '../context/AppContext';

import { AppView } from '../types';

export const POPIAConsent: React.FC = () => {
  const { user, updateUser, setView, view } = useApp();
  // If user exists, check metadata. If guest, default to open (true).
  const [isOpen, setIsOpen] = useState(() => {
      if (user) return !user.metadata?.popia_consent;
      return true;
  });

  // Reset isOpen when entering the POPIA_CONSENT view
  React.useEffect(() => {
      if (view === AppView.POPIA_CONSENT) {
          setIsOpen(true);
      }
  }, [view]);

  // Determine visibility
  const shouldShow = isOpen && view !== AppView.PRIVACY_POLICY && (
      // Case 1: Logged in user who hasn't consented
      (user && !user.metadata?.popia_consent) || 
      // Case 2: Guest user explicitly on the consent step
      (!user && view === AppView.POPIA_CONSENT)
  );

  if (!shouldShow) return null;

  const handleAccept = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 1. Optimistic UI Update: Close immediately
    setIsOpen(false);

    if (user) {
        // 2. Update local user context immediately so app knows we have consent
        updateUser({
            metadata: {
                ...user.metadata,
                popia_consent: true,
                consent_date: new Date().toISOString()
            }
        });

        // 3. Fire and forget backend update (don't block UI)
        // Skip backend sync for demo users to avoid UUID errors
        if (!user.isDemo) {
            PrivacyService.recordConsent(user.id).catch(err => {
                console.error("Background consent sync failed:", err);
            });
        }
    } else {
        // Guest Flow: Navigate to Register
        setView(AppView.REGISTER);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in pointer-events-auto">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-brand-teal"></div>
        
        <div className="size-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center mb-6">
          <Icon name="gavel" className="text-brand-teal text-3xl" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 leading-tight mb-4">
          Your Privacy Matters (POPIA)
        </h2>
        
        <div className="space-y-4 mb-8">
          <p className="text-sm text-slate-600 leading-relaxed">
            To provide our services in South Africa, SwiftZA needs to process your personal information, including:
          </p>
          
          <ul className="space-y-3">
            {[
              { icon: 'location_on', text: 'Real-time GPS for trip tracking and safety.' },
              { icon: 'person', text: 'ID and License data for regulatory compliance.' },
              { icon: 'phone', text: 'Contact details for communication.' }
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <Icon name={item.icon} className="text-brand-teal text-lg mt-0.5" />
                <span className="text-xs font-medium text-slate-500">{item.text}</span>
              </li>
            ))}
          </ul>

          <p className="text-[10px] text-slate-400 font-medium italic">
            By clicking "Accept", you agree to our Privacy Policy and consent to the processing of your data as per the Protection of Personal Information Act.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleAccept}
            className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Accept & Continue
          </button>
          <button 
            onClick={() => setView(AppView.PRIVACY_POLICY)}
            className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-2"
          >
            Read Full Policy
          </button>
        </div>
      </div>
    </div>
  );
};
