import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AppView, UserRole, RideHistoryItem, TransactionType } from '../types';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icons';
import { supabase } from '../lib/supabase';

// Import Specific Sub-Components for Creator
import { RideHistory } from '../components/profile/RideHistory';
import { PaymentMethods } from '../components/profile/PaymentMethods';
import { DataPrivacySettings } from '../components/profile/DataPrivacySettings';
import { EditProfile } from '../components/profile/EditProfile';

type CreatorProfileSection = 'MAIN' | 'SAVED' | 'HISTORY' | 'PAYMENT' | 'PRIVACY' | 'EDIT';

// Mock History Data for SA Context
const MOCK_HISTORY: RideHistoryItem[] = [
    { 
        id: 'trip_101', 
        date: 'Yesterday, 14:30', 
        pickup: 'Woolworths Sandton',
        dropoff: '90 Rivonia Rd', 
        price: 125.00, 
        status: 'Completed', 
        driver: 'Thabo M.', 
        rating: 5,
        breakdown: { baseFare: 40, distanceFare: 20, stops: 0, tax: 5, total: 125 }
    },
    { 
        id: 'trip_100', 
        date: 'Mon, 08:15', 
        pickup: 'Rosebank Mall (Pick n Pay)',
        dropoff: 'Park Station', 
        price: 85.00, 
        status: 'Completed', 
        driver: 'Sarah L.', 
        rating: 4,
        breakdown: { baseFare: 40, distanceFare: 40, stops: 0, tax: 5, total: 85 }
    },
    { 
        id: 'trip_99', 
        date: 'Last Week', 
        pickup: '12 Bryanston Dr',
        dropoff: 'The William', 
        price: 450.00, 
        status: 'Completed', 
        driver: 'John D. (Truck)', 
        rating: 5,
        breakdown: { baseFare: 300, distanceFare: 100, stops: 0, tax: 50, total: 450 }
    },
];

export const CreatorProfile: React.FC = () => {
  const { setView, user, logout, updateUser, navigate } = useApp();
  const [subView, setSubView] = useState<CreatorProfileSection>('MAIN');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (!user) return null;

  // --- DATA SEPARATION LOGIC ---
  const historyData = user.isDemo ? MOCK_HISTORY : [];
  
  // Prioritize user's uploaded profile URL, fallback to demo/placeholder
  const profileImage = user.profileUrl 
    ? user.profileUrl 
    : user.isDemo 
        ? "https://i.pravatar.cc/100?img=11" 
        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

  const handleRoleSwitch = () => {
      updateUser({ role: UserRole.DRIVER });
      setTimeout(() => setView(AppView.DRIVER_HOME), 500);
  };

  const handleVerifyIdentity = async () => {
      setIsVerifying(true);
      try {
          const { data, error } = await supabase.functions.invoke('start-kyc');
          
          if (error) {
              console.error("KYC Function Error:", error);
              throw new Error("Verification unavailable. Function not deployed?");
          }
          
          if (data?.url) {
              window.location.href = data.url;
          } else {
              alert("Verification service is offline. Please try again later.");
          }
      } catch (e: any) {
          console.error("KYC Catch:", e);
          alert("Service unavailable. Please contact support.");
      } finally {
          setIsVerifying(false);
      }
  };

  // --- INVITE MODAL LOGIC ---
  const InviteFriendsModal = () => {
      const referralCode = `${user.name.split(' ')[0].toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const handleShare = async () => {
          const text = `Join me on SwiftZA! Use my code ${referralCode} to get R15 off your first ride. Download here: https://swiftza.app`;
          if (navigator.share) {
              try {
                  await navigator.share({
                      title: 'Join SwiftZA',
                      text: text,
                      url: 'https://swiftza.app'
                  });
              } catch (err) {
                  console.log('Share closed');
              }
          } else {
              navigator.clipboard.writeText(text);
              alert("Referral link copied to clipboard!");
          }
      };

      const handleSimulateReferral = () => {
          // Demo functionality to show the reward
          const reward = 15;
          updateUser({
              wallet: {
                  ...user.wallet,
                  balance: user.wallet.balance + reward,
                  ledger: [
                      {
                          id: Date.now().toString(),
                          date: new Date().toISOString(),
                          description: 'Referral Bonus (Friend Joined)',
                          amount: reward,
                          type: TransactionType.ADJUSTMENT,
                          balanceAfter: user.wallet.balance + reward
                      },
                      ...user.wallet.ledger
                  ]
              }
          });
          alert(`Great success! A friend used your code. R${reward} added to wallet.`);
          setShowInviteModal(false);
      };

      return createPortal(
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up relative overflow-hidden text-center shadow-2xl">
                  <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                      <Icon name="close" className="text-xl" />
                  </button>

                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-purple">
                      <Icon name="card_giftcard" className="text-4xl" />
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Invite & Earn R15</h2>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                      Share your code with friends. You get <span className="font-bold text-brand-purple">R15 credit</span> when they complete their first ride!
                  </p>

                  <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 mb-6 relative group cursor-pointer active:scale-95 transition-transform" onClick={() => {navigator.clipboard.writeText(referralCode); alert('Code copied!')}}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Code</p>
                      <p className="text-2xl font-mono font-black text-slate-800 tracking-wider">{referralCode}</p>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-primary">
                          <Icon name="content_copy" />
                      </div>
                  </div>

                  <div className="space-y-3">
                      <button 
                          onClick={handleShare}
                          className="w-full h-14 bg-brand-purple text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                      >
                          <Icon name="ios_share" className="text-xl" /> Share Link
                      </button>
                      
                      {user.isDemo && (
                          <button 
                              onClick={handleSimulateReferral}
                              className="w-full py-3 text-xs font-bold text-green-600 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                          >
                              (Demo) Simulate Successful Referral
                          </button>
                      )}
                  </div>
              </div>
          </div>,
          document.body
      );
  };

  // --- SUB-VIEW ROUTING ---
  if (subView === 'HISTORY') return <RideHistory history={historyData} onBack={() => setSubView('MAIN')} />;
  if (subView === 'PAYMENT') return <PaymentMethods onBack={() => setSubView('MAIN')} />;
  if (subView === 'PRIVACY') return <DataPrivacySettings onBack={() => setSubView('MAIN')} />;
  if (subView === 'EDIT') return <EditProfile onBack={() => setSubView('MAIN')} />;

  const MenuItem = ({ 
      icon, 
      label, 
      colorClass, 
      onClick, 
      isLast = false
  }: { 
      icon: string, 
      label: string, 
      colorClass: string, 
      onClick: () => void, 
      isLast?: boolean
  }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center justify-between py-3 px-3 hover:bg-slate-50 transition-colors active:scale-[0.99] group ${!isLast ? 'border-b border-slate-50' : ''}`}
    >
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass} transition-colors shadow-sm`}>
                <Icon name={icon} className="text-lg" />
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{label}</span>
        </div>
        <Icon name="chevron_right" className="text-slate-300 group-hover:text-primary transition-colors text-lg" />
    </button>
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col font-sans text-slate-900 relative">
      {showInviteModal && <InviteFriendsModal />}
      
      {/* 1. Compact Header - Fixed */}
      <div className="px-5 pt-safe-top pb-3 bg-white shrink-0 z-10 border-b border-slate-100 flex items-center justify-between h-[80px] shadow-sm">
         <div className="flex items-center gap-3">
             <div className="relative">
                 <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-slate-50 shadow-sm" />
                 {user.isVerified && (
                     <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px]">
                         <div className="text-[10px] text-white bg-green-500 rounded-full p-0.5 flex items-center justify-center">
                            <Icon name="check" className="text-[8px]" />
                         </div>
                     </div>
                 )}
             </div>
             <div>
                 <h2 className="text-base font-extrabold text-slate-900 leading-tight">{user.name}</h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                     {user.isVerified ? 'Verified Creator' : 'Unverified'}
                 </p>
             </div>
         </div>
         
         {!user.isVerified && (
             <button 
                onClick={handleVerifyIdentity}
                className="text-[10px] font-bold text-white bg-brand-teal px-3 py-1.5 rounded-full hover:bg-teal-600 transition-colors shadow-sm animate-pulse flex items-center gap-1"
             >
                 {isVerifying ? <span className="animate-spin material-symbols-rounded text-sm">progress_activity</span> : <Icon name="verified_user" className="text-sm" />}
                 {isVerifying ? 'Loading...' : 'Verify ID'}
             </button>
         )}
         {user.isVerified && (
             <button 
                onClick={() => setSubView('EDIT')}
                className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-colors"
             >
                 Edit Profile
             </button>
         )}
      </div>

      {/* 2. Main Content - Padded at bottom to clear Nav */}
      <div className="flex-1 px-4 py-4 flex flex-col justify-between pb-nav overflow-y-auto">
        
        {/* Mode Switcher - DEMO ONLY */}
        {user.isDemo && (
            <div 
                onClick={handleRoleSwitch}
                className="bg-slate-900 rounded-xl p-3 shadow-lg shadow-slate-200 text-white flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden shrink-0 group h-[70px] mb-4"
            >
                <div className="absolute right-0 top-0 w-32 h-32 bg-brand-purple/20 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover:bg-brand-purple/30 transition-colors"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-brand-purple border border-white/10 shadow-inner">
                        <Icon name="directions_car" className="text-lg" />
                    </div>
                    <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Switch Mode</p>
                        <h3 className="text-sm font-bold leading-none">Creator Account</h3>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1.5 rounded-lg border border-white/5 relative z-10 group-hover:bg-white/20 transition-colors">
                        <span className="text-[9px] font-bold text-white">Driver</span>
                        <Icon name="arrow_forward" className="text-white text-sm" />
                </div>
            </div>
        )}

        {/* Menu List - Compact Group */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col shrink-0">
            <MenuItem 
                icon="bookmark" 
                label="Saved Places" 
                colorClass="bg-pink-50 text-pink-500" 
                onClick={() => navigate(AppView.SAVED_PLACES)} 
            />
            <MenuItem 
                icon="history" 
                label="Activity History" 
                colorClass="bg-blue-50 text-blue-500" 
                onClick={() => setSubView('HISTORY')} 
            />
            <MenuItem 
                icon="credit_card" 
                label="Payment Methods" 
                colorClass="bg-green-50 text-green-500" 
                onClick={() => setSubView('PAYMENT')} 
            />
             <MenuItem 
                icon="help_support_bubble" 
                label="Help & Support" 
                colorClass="bg-purple-50 text-purple-500" 
                onClick={() => setView(AppView.HELP_SUPPORT)} 
            />
            <MenuItem 
                icon="lock" 
                label="Privacy & Data" 
                colorClass="bg-slate-100 text-slate-600" 
                onClick={() => setSubView('PRIVACY')} 
                isLast
            />
        </div>

        {/* Promo Card - Updated for Invite Friends */}
        <div 
            onClick={() => setShowInviteModal(true)}
            className="bg-gradient-to-r from-brand-purple/5 to-blue-50 rounded-xl p-3 border border-brand-purple/10 flex items-center gap-3 shrink-0 h-[60px] mt-4 cursor-pointer active:scale-[0.98] transition-transform"
        >
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-purple shrink-0">
                <Icon name="card_giftcard" className="text-lg" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">Invite Friends</h4>
                <p className="text-[10px] text-slate-500 truncate">Get R15 credit for every paying friend.</p>
            </div>
             <Icon name="chevron_right" className="text-slate-400 text-lg" />
        </div>

        {/* Logout - Ghost Style */}
        <button onClick={logout} className="w-full py-2 text-red-500 font-bold text-xs hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-[0.98] opacity-80 hover:opacity-100 mt-auto">
            <Icon name="logout" className="text-base" />
            Sign Out
        </button>

      </div>
    </div>
  );
};