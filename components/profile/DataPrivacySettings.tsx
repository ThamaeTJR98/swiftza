import React, { useState } from 'react';
import { Icon } from '../Icons';
import { PrivacyService } from '../../services/PrivacyService';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';
import { LocationService } from '../../services/LocationService';

interface DataPrivacySettingsProps {
  onBack: () => void;
}

type PrivacyTab = 'SETTINGS' | 'RIGHTS' | 'TRANSPARENCY';

export const DataPrivacySettings: React.FC<DataPrivacySettingsProps> = ({ onBack }) => {
  const { user, updateUser, setView } = useApp();
  const [loading, setLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PrivacyTab>('SETTINGS');

  if (!user) return null;

  const locationEnabled = user.preferences?.locationSharing ?? true;
  const adsEnabled = user.preferences?.personalizedAds ?? false;

  const toggleLocation = () => {
    const newState = !locationEnabled;
    updateUser({
      preferences: {
        locationSharing: newState,
        personalizedAds: adsEnabled,
        marketingEmails: user.preferences?.marketingEmails ?? false
      }
    });
    if (newState) {
      if (!user.isDemo) {
        LocationService.startTracking(user.id);
      }
    } else {
      LocationService.stopTracking();
    }
  };

  const toggleAds = () => {
    const newState = !adsEnabled;
    updateUser({
      preferences: {
        locationSharing: locationEnabled,
        personalizedAds: newState,
        marketingEmails: user.preferences?.marketingEmails ?? false
      }
    });
  };

  const handleExport = async () => {
    setLoading('export');
    try {
      const res = await PrivacyService.requestDataExport(user.id);
      alert(res.message);
    } catch (e) {
      alert("Request failed. Please try again later.");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you absolutely sure? This will deactivate your account and initiate the data scrubbing process as per POPIA guidelines. This cannot be undone.");
    
    if (confirmed) {
      setLoading('delete');
      try {
        await PrivacyService.requestAccountDeletion(user.id);
        alert("Your request has been received. You will be logged out shortly.");
        window.location.reload();
      } catch (e) {
        alert("Request failed.");
      } finally {
        setLoading(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans animate-slide-up">
      <div className="shrink-0 bg-white pt-safe-top border-b border-slate-50 h-[60px] flex items-center px-4">
        <button onClick={onBack} className="size-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-600 active:scale-90 transition-transform">
          <Icon name="arrow_back_ios_new" className="text-base" />
        </button>
        <h2 className="flex-1 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 pr-10">Data & Privacy</h2>
      </div>

      {/* Tabs Navigation */}
      <div className="shrink-0 bg-white border-b border-slate-100 px-4 flex gap-6 overflow-x-auto no-scrollbar z-10">
        {(['SETTINGS', 'RIGHTS', 'TRANSPARENCY'] as PrivacyTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 text-[10px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
              activeTab === tab ? 'text-brand-teal' : 'text-slate-400'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-teal rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-32">
        
        {activeTab === 'SETTINGS' && (
          <div className="space-y-8 animate-fade-in">
            <section className="space-y-4">
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Data Permissions</h3>
              <div className="bg-slate-50 rounded-3xl p-2 border border-slate-100 divide-y divide-slate-100">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-black text-slate-900">Location Sharing</p>
                    <p className="text-[10px] text-slate-500 font-medium">Tracking for accurate pickups & safety.</p>
                  </div>
                  <button 
                    onClick={toggleLocation}
                    className={`w-12 h-6 rounded-full transition-colors relative ${locationEnabled ? 'bg-brand-teal' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${locationEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-black text-slate-900">Personalized Ads</p>
                    <p className="text-[10px] text-slate-500 font-medium">Tailored offers in your province.</p>
                  </div>
                  <button 
                    onClick={toggleAds}
                    className={`w-12 h-6 rounded-full transition-colors relative ${adsEnabled ? 'bg-brand-teal' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${adsEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            </section>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <Icon name="info" className="text-blue-500" />
              <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                SwiftZA is fully compliant with the South African Protection of Personal Information Act (POPIA). Your data is encrypted and stored securely within the Republic.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'RIGHTS' && (
          <div className="space-y-8 animate-fade-in">
            <section className="space-y-4">
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Your POPIA Rights</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-brand-teal shrink-0">
                      <Icon name="download" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 mb-1">Download Your Data</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Request a copy of all personal information SwiftZA has collected about you.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleExport}
                    disabled={!!loading}
                    className="w-full bg-white border border-slate-200 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 active:scale-95 transition-all shadow-sm"
                  >
                    {loading === 'export' ? 'Processing...' : 'Request Export'}
                  </button>
                </div>

                <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-red-500 shrink-0">
                      <Icon name="delete_forever" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-900 mb-1">Right to be Forgotten</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Request the permanent deletion of your account and personal data.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDelete}
                    disabled={!!loading}
                    className="w-full bg-white border border-red-100 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600 active:scale-95 transition-all shadow-sm"
                  >
                    {loading === 'delete' ? 'Processing...' : 'Delete My Account'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'TRANSPARENCY' && (
          <div className="space-y-8 animate-fade-in">
            <section className="space-y-4">
              <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Transparency & Policies</h3>
              <div className="space-y-2">
                {[
                  { title: 'Privacy Policy', icon: 'description', view: AppView.PRIVACY_POLICY },
                  { title: 'Cookie Policy', icon: 'cookie', view: AppView.COOKIE_POLICY },
                  { title: 'Terms of Service', icon: 'gavel', view: AppView.TERMS_OF_SERVICE }
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => setView(item.view)}
                    className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl active:bg-slate-50 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <Icon name={item.icon} className="text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">{item.title}</span>
                    </div>
                    <Icon name="chevron_right" className="text-slate-300" />
                  </button>
                ))}
              </div>
            </section>

            <div className="bg-brand-teal/5 rounded-3xl p-6 border border-brand-teal/10">
              <h4 className="text-brand-teal text-xs font-black uppercase tracking-widest mb-2">Data Retention</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                We retain your personal information for as long as your account is active or as needed to provide you services. We also retain data as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
