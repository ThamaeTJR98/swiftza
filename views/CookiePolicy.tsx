import React from 'react';
import { Icon } from '../components/Icons';
import { useApp } from '../context/AppContext';
import { AppView } from '../types';

export const CookiePolicy: React.FC = () => {
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
        <h1 className="text-lg font-black uppercase tracking-wider">Cookie Policy</h1>
        <div className="size-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <section>
          <h2 className="text-2xl font-black text-slate-900 mb-4">How we use Cookies</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            SwiftZA uses cookies and similar technologies to provide, protect, and improve our services. This policy explains how and why we use these technologies.
          </p>
        </section>

        <section className="space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-2">Essential Cookies</h3>
            <p className="text-xs text-slate-500">These are necessary for the app to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms.</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-2">Performance Cookies</h3>
            <p className="text-xs text-slate-500">These allow us to count visits and traffic sources so we can measure and improve the performance of our app. They help us to know which pages are the most and least popular and see how visitors move around the app.</p>
          </div>
        </section>
      </div>
    </div>
  );
};
