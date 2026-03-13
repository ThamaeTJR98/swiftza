import React, { useState } from 'react';
import { AppView, UserRole } from '../types';
import { useApp } from '../context/AppContext';
// Added missing Icon import
import { Icon } from '../components/Icons';

// Import Sub-Components
import { ManageVehicles } from '../components/profile/ManageVehicles';
import { ProviderCompliance } from '../components/profile/ProviderCompliance';
import { EarningsTax } from '../components/profile/EarningsTax';
import { DataPrivacySettings } from '../components/profile/DataPrivacySettings';
import { EditProfile } from '../components/profile/EditProfile';
import { BankDetails } from '../components/profile/BankDetails';

type DriverProfileSection = 'MAIN' | 'VEHICLE' | 'COMPLIANCE' | 'EARNINGS' | 'PRIVACY' | 'EDIT' | 'BANK';

export const DriverProfile: React.FC = () => {
  const { setView, user, logout, updateUser } = useApp();
  const [subView, setSubView] = useState<DriverProfileSection>('MAIN');

  if (!user) return null;

  // --- DATA SEPARATION ---
  const stats = user.isDemo 
    ? { trips: "1,240", years: "3", rate: "98%" } 
    : { trips: "0", years: "0", rate: "-" };
    
  // Prioritize uploaded image
  const profileImage = user.profileUrl
    ? user.profileUrl
    : user.isDemo 
        ? "https://i.pravatar.cc/300?img=33" 
        : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

  // --- SUB-VIEW ROUTING ---
  if (subView === 'VEHICLE') return <ManageVehicles onBack={() => setSubView('MAIN')} />;
  if (subView === 'COMPLIANCE') return <ProviderCompliance onBack={() => setSubView('MAIN')} />;
  if (subView === 'EARNINGS') return <EarningsTax onBack={() => setSubView('MAIN')} />;
  if (subView === 'PRIVACY') return <DataPrivacySettings onBack={() => setSubView('MAIN')} />;
  if (subView === 'EDIT') return <EditProfile onBack={() => setSubView('MAIN')} />;
  if (subView === 'BANK') return <BankDetails onBack={() => setSubView('MAIN')} />;

  const handleRoleSwitch = () => {
      updateUser({ role: UserRole.CREATOR });
      setTimeout(() => setView(AppView.HOME), 500);
  };

  const CompactMenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onClick, 
    iconColor = "text-brand-teal", 
    bgColor = "bg-teal-50" 
  }: { icon: string, title: string, subtitle: string, onClick: () => void, iconColor?: string, bgColor?: string }) => (
    <div 
        onClick={onClick}
        className="flex items-center gap-3 px-3 py-2.5 justify-between border-b border-slate-50 last:border-0 active:bg-slate-50 transition-colors cursor-pointer"
    >
        <div className="flex items-center gap-3">
            <div className={`${iconColor} flex items-center justify-center rounded-lg ${bgColor} shrink-0 size-9`}>
                <span className="material-symbols-rounded text-xl">{icon}</span>
            </div>
            <div className="flex flex-col justify-center">
                <p className="text-slate-900 text-sm font-semibold leading-tight">{title}</p>
                <p className="text-slate-500 text-[10px] font-normal leading-normal">{subtitle}</p>
            </div>
        </div>
        <span className="material-symbols-rounded text-slate-400 text-lg">chevron_right</span>
    </div>
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col relative overflow-hidden font-sans text-slate-900">
      
      {/* Top Navigation Bar - Compact */}
      <div className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-md pt-safe-top border-b border-slate-100">
        <div className="flex items-center px-4 py-2 justify-between">
            <div className="w-8"></div>
            <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight">Profile Hub</h2>
            <div className="w-8 flex justify-end">
                <button onClick={() => setSubView('PRIVACY')} className="text-slate-600 active:opacity-50">
                    <span className="material-symbols-rounded text-xl">settings</span>
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-nav">
            
            {/* Compact Profile Header */}
            <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm border border-slate-100">
                <div className="relative shrink-0">
                    <div 
                        className="bg-brand-teal/10 flex items-center justify-center rounded-full size-16 border-2 border-white shadow-sm overflow-hidden bg-cover bg-center"
                        style={{ backgroundImage: `url("${profileImage}")` }}
                    >
                        {!user && <span className="material-symbols-rounded text-3xl text-brand-teal">person</span>}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white size-4 rounded-full shadow-sm"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <h3 className="text-slate-900 text-lg font-bold truncate">{user.name}</h3>
                            <span className="material-symbols-rounded text-brand-teal text-lg" title="Verified">verified</span>
                        </div>
                        <button onClick={() => setSubView('EDIT')} className="text-slate-400 hover:text-slate-600 active:scale-90 transition-transform">
                            <span className="material-symbols-rounded text-xl">edit_square</span>
                        </button>
                    </div>
                    <p className="text-slate-500 text-xs font-medium">Independent Provider</p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-rounded text-brand-teal text-sm">star</span>
                        <span className="text-slate-900 text-xs font-bold">{user.rating} Rating</span>
                    </div>
                </div>
            </div>

            {/* Compact Stats Row */}
            <div className="flex flex-row bg-white rounded-xl py-3 px-1 shadow-sm border border-slate-100 divide-x divide-slate-100">
                <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Trips</p>
                    <p className="text-slate-900 text-base font-bold">{stats.trips}</p>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Years</p>
                    <p className="text-slate-900 text-base font-bold">{stats.years}</p>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-0.5">
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">Rate</p>
                    <p className="text-slate-900 text-base font-bold">{stats.rate}</p>
                </div>
            </div>

            {/* Service Management Section */}
            <div>
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 px-1">Management</h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <CompactMenuItem 
                        icon="local_shipping" 
                        title="Vehicle & Role" 
                        subtitle={`Active: ${user.vehicleType || 'Not Set'}`} 
                        onClick={() => setSubView('VEHICLE')} 
                    />
                    <CompactMenuItem 
                        icon="payments" 
                        title="Earnings & Tax" 
                        subtitle="Balance & Certificates" 
                        onClick={() => setSubView('EARNINGS')} 
                    />
                    <CompactMenuItem 
                        icon="account_balance" 
                        title="Bank Details" 
                        subtitle="Payout Destination" 
                        onClick={() => setSubView('BANK')} 
                    />
                    <CompactMenuItem 
                        icon="description" 
                        title="Compliance Docs" 
                        subtitle="ID, License, Permits" 
                        onClick={() => setSubView('COMPLIANCE')} 
                    />
                    {user.isDemo && (
                        <CompactMenuItem 
                            icon="swap_horiz" 
                            title="Switch to Creator" 
                            subtitle="Customer view" 
                            onClick={handleRoleSwitch} 
                            iconColor="text-purple-600"
                            bgColor="bg-purple-50"
                        />
                    )}
                </div>
            </div>

            {/* Support & Logout */}
            <div className="grid grid-cols-2 gap-3 pb-24">
                 <div 
                    onClick={() => setView(AppView.HELP_SUPPORT)}
                    className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex flex-col items-center text-center active:scale-[0.98] transition-transform cursor-pointer"
                >
                    <div className="size-8 rounded-full bg-teal-50 text-brand-teal flex items-center justify-center mb-2">
                        <Icon name="help_support_bubble" className="text-lg" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">Support</p>
                 </div>

                 <div 
                    onClick={logout}
                    className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex flex-col items-center text-center active:scale-[0.98] transition-transform cursor-pointer"
                >
                    <div className="size-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2">
                        <span className="material-symbols-rounded text-lg">logout</span>
                    </div>
                    <p className="text-xs font-bold text-red-500">Logout</p>
                 </div>
            </div>
      </div>
    </div>
  );
};