import React, { useState } from 'react';
import { AppView, UserRole } from '../types';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icons';

export const Login: React.FC = () => {
  const { signInWithEmail, setView, setRegistrationRole } = useApp();
  const [role, setRole] = useState<UserRole>(UserRole.CREATOR);
  
  // Form Data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        alert("Please fill in all fields");
        return;
    }

    setIsLoading(true);
    try {
        await signInWithEmail(email, password);
    } catch (err: any) {
        alert("Login Error: " + err.message);
        setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
      // Explicitly use "demo" string to trigger demo logic in AppContext
      signInWithEmail(`demo_${role.toLowerCase()}@swiftza.app`, 'demo123');
  };

  const goToRegister = () => {
      setRegistrationRole(role);
      setView(AppView.POPIA_CONSENT);
  }

  return (
    <div className="h-full flex flex-col bg-surface-white px-6 pt-safe-top pb-safe md:max-w-md md:mx-auto md:shadow-xl md:rounded-2xl md:h-auto md:min-h-[600px] md:my-10 bg-white relative z-20 overflow-hidden">
      
      {/* Decorative Background Blob */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl rounded-bl-full opacity-10 pointer-events-none -mr-16 -mt-16 z-0 ${role === UserRole.DRIVER ? 'from-brand-teal to-transparent' : 'from-brand-purple to-transparent'}`}></div>

      {/* Back Button */}
      <div className="mb-2 mt-4 relative z-10">
        <button 
            onClick={() => setView(AppView.ONBOARDING)}
            aria-label="Back"
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors text-text-main active:scale-95"
        >
            <Icon name="arrow_back" className="text-2xl" />
        </button>
      </div>

      <div className="mb-6 relative z-10">
        <div className="flex items-center gap-2 mb-2">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-gold"></span>
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">SwiftZA • South Africa</span>
        </div>
        <h1 className="text-3xl font-extrabold text-text-main mb-1 tracking-tight">Welcome Back</h1>
        <p className="text-text-sub font-medium flex items-center gap-1">
            Log in to <span className="text-brand-teal font-bold">Move Mzansi</span>
            <Icon name="favorite" className="text-red-500 text-xs animate-pulse" />
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-6 animate-slide-up relative z-10">
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* Role Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-2">
                <button 
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === UserRole.CREATOR ? 'bg-white shadow-sm text-brand-purple' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setRole(UserRole.CREATOR)}
                >
                    <Icon name="person_outline" className="text-lg" /> Customer
                </button>
                <button 
                    type="button"
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === UserRole.DRIVER ? 'bg-white shadow-sm text-brand-teal' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setRole(UserRole.DRIVER)}
                >
                    <Icon name="work" className="text-lg" /> Partner
                </button>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary bg-gray-50 focus:bg-white transition-colors"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-primary bg-gray-50 focus:bg-white transition-colors"
                    required
                />
            </div>

            <Button fullWidth type="submit" disabled={isLoading} className={role === UserRole.DRIVER ? '!bg-brand-teal !text-white !shadow-brand-teal/20' : '!bg-brand-purple !text-white !shadow-brand-purple/20'}>
                {isLoading ? 'Logging in...' : 'Log In'}
            </Button>
        </form>

        <div className="mt-auto text-center pb-6 space-y-4">
            <p className="text-sm text-gray-500">
                Don't have an account? <button onClick={goToRegister} className={`font-bold hover:underline ${role === UserRole.DRIVER ? 'text-brand-teal' : 'text-brand-purple'}`}>Sign up</button>
            </p>
            
            <div className="pt-4 border-t border-gray-100">
                <button 
                    onClick={handleDemoLogin}
                    className="w-full py-3 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-100 transition-colors"
                >
                    <Icon name="play_circle" className="text-lg" />
                    Enter Demo Mode
                </button>
                <p className="text-[10px] text-gray-400 mt-2">Populated with sample data for testing</p>
            </div>
        </div>
      </div>
    </div>
  );
};