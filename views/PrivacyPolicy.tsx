import React from 'react';
import { Icon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';

export const PrivacyPolicy: React.FC = () => {
  const { setView, user } = useApp();

  return (
    <div className="h-full bg-white flex flex-col font-sans text-slate-900 animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-safe-top pb-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10">
        <button 
          onClick={() => setView(user ? AppView.PROFILE : AppView.LOGIN)}
          className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Icon name="close" className="text-xl" />
        </button>
        <h1 className="text-lg font-black uppercase tracking-wider">Privacy Policy</h1>
        <div className="size-10" /> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
              <Icon name="gavel" className="text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">POPIA Compliance</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Effective Date: 01 Jan 2025</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            SwiftZA is committed to protecting your privacy in accordance with the Protection of Personal Information Act (POPIA) of South Africa. This policy outlines how we collect, use, process, and store your personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Icon name="folder_open" className="text-brand-teal" />
            1. Information We Collect
          </h3>
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
            <div className="flex gap-3">
              <Icon name="person" className="text-slate-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Personal Details</p>
                <p className="text-xs text-slate-500">Name, email address, phone number, and profile photograph.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Icon name="location_on" className="text-slate-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Location Data</p>
                <p className="text-xs text-slate-500">Real-time GPS data during trips and when the app is open, to facilitate rides and safety features.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Icon name="credit_card" className="text-slate-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-900">Financial Data</p>
                <p className="text-xs text-slate-500">Transaction history and payment method details (processed securely via PCI-compliant gateways).</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Icon name="settings_suggest" className="text-brand-teal" />
            2. How We Use Your Data
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600 marker:text-brand-teal">
            <li>To connect riders with drivers and facilitate transportation services.</li>
            <li>To ensure safety through real-time tracking and emergency features.</li>
            <li>To process payments and generate tax invoices.</li>
            <li>To communicate important service updates and safety alerts.</li>
            <li>To comply with South African transport regulations and legal obligations.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Icon name="share" className="text-brand-teal" />
            3. Data Sharing
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We do not sell your personal data. We only share information with:
          </p>
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-3">
              <Icon name="local_police" className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Law Enforcement (when legally required)</span>
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center gap-3">
              <Icon name="security" className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700">Safety Partners (e.g., Armed Response)</span>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Icon name="verified_user" className="text-brand-teal" />
            4. Your Rights
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-2">
            Under POPIA, you have the right to:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-brand-teal/5 p-3 rounded-xl text-center">
              <Icon name="visibility" className="text-brand-teal mb-1" />
              <p className="text-[10px] font-bold text-brand-teal uppercase">Access</p>
              <p className="text-[9px] text-slate-500">View your data</p>
            </div>
            <div className="bg-brand-teal/5 p-3 rounded-xl text-center">
              <Icon name="edit" className="text-brand-teal mb-1" />
              <p className="text-[10px] font-bold text-brand-teal uppercase">Correct</p>
              <p className="text-[9px] text-slate-500">Update details</p>
            </div>
            <div className="bg-brand-teal/5 p-3 rounded-xl text-center">
              <Icon name="delete" className="text-brand-teal mb-1" />
              <p className="text-[10px] font-bold text-brand-teal uppercase">Delete</p>
              <p className="text-[9px] text-slate-500">Request removal</p>
            </div>
            <div className="bg-brand-teal/5 p-3 rounded-xl text-center">
              <Icon name="gavel" className="text-brand-teal mb-1" />
              <p className="text-[10px] font-bold text-brand-teal uppercase">Object</p>
              <p className="text-[9px] text-slate-500">Limit processing</p>
            </div>
          </div>
        </section>

        <section className="bg-slate-900 text-white p-6 rounded-3xl text-center space-y-4">
          <h3 className="text-lg font-black uppercase">Contact Information Officer</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            If you have any questions about this policy or wish to exercise your rights, please contact our Information Officer.
          </p>
          <a href="mailto:privacy@swiftza.co.za" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-colors">
            <Icon name="mail" />
            privacy@swiftza.co.za
          </a>
        </section>

      </div>
    </div>
  );
};
