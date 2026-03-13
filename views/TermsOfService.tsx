import React from 'react';
import { Icon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';

export const TermsOfService: React.FC = () => {
  const { setView, user } = useApp();

  return (
    <div className="h-full bg-white flex flex-col font-sans text-slate-900 animate-slide-up overflow-hidden">
      <div className="px-5 pt-safe-top pb-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
        <button 
          onClick={() => setView(user ? AppView.PROFILE : AppView.LOGIN)}
          className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Icon name="close" className="text-xl" />
        </button>
        <h1 className="text-lg font-black uppercase tracking-wider">Terms of Service</h1>
        <div className="size-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <section>
          <h2 className="text-2xl font-black text-slate-900 mb-4">SwiftZA Terms</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            By using SwiftZA, you agree to these terms. Please read them carefully.
          </p>
        </section>

        <section className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-2">1. User Accounts</h3>
            <p className="text-xs text-slate-500">You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-2">2. Service Usage</h3>
            <p className="text-xs text-slate-500">SwiftZA provides a platform to connect users with independent service providers. We do not provide transportation or errand services directly.</p>
          </div>
        </section>
      </div>
    </div>
  );
};
