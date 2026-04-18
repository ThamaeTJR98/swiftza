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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex flex-col bg-surface-white px-5 pt-safe-top pb-safe md:max-w-md md:mx-auto md:shadow-xl md:rounded-2xl md:h-auto md:min-h-[600px] md:my-10 bg-white relative z-20 overflow-y-auto no-scrollbar">
      
      {/* Decorative Background Blob */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl rounded-bl-full opacity-10 pointer-events-none -mr-16 -mt-16 z-0 ${role === UserRole.DRIVER ? 'from-brand-teal to-transparent' : 'from-brand-purple to-transparent'}`}></div>

      {/* Back Button */}
      <div className="mb-0.5 mt-1 relative z-10">
        <button 
            onClick={() => setView(AppView.ONBOARDING)}
            aria-label="Back"
            className="w-8 h-8 -ml-1 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors text-text-main active:scale-95"
        >
            <Icon name="arrow_back" className="text-lg" />
        </button>
      </div>

      <div className="mb-3 relative z-10">
        <div className="flex items-center gap-2 mb-0.5">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-gold"></span>
            </div>
            <span className="text-[8px] font-bold tracking-widest uppercase text-slate-400">SwiftZA • South Africa</span>
        </div>
        <h1 className="text-xl font-extrabold text-text-main mb-0 tracking-tight">Welcome Back</h1>
        <p className="text-text-sub text-[11px] font-medium flex items-center gap-1">
            Log in to <span className="text-brand-teal font-bold">Move Mzansi</span>
            <Icon name="favorite" className="text-red-500 text-[9px] animate-pulse" />
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-3 animate-slide-up relative z-10">
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
            {/* Role Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-0.5">
                <button 
                    type="button"
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${role === UserRole.CREATOR ? 'bg-white shadow-sm text-brand-purple' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setRole(UserRole.CREATOR)}
                >
                    <Icon name="person_outline" className="text-sm" /> Customer
                </button>
                <button 
                    type="button"
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${role === UserRole.DRIVER ? 'bg-white shadow-sm text-brand-teal' : 'text-gray-400 hover:text-gray-600'}`}
                    onClick={() => setRole(UserRole.DRIVER)}
                >
                    <Icon name="work" className="text-sm" /> Partner
                </button>
            </div>

            <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-primary bg-gray-50 focus:bg-white transition-colors text-sm"
                    required
                />
            </div>

            <div>
                <label className="block text-[9px] font-bold text-gray-500 mb-0.5 uppercase">Password</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-primary bg-gray-50 focus:bg-white transition-colors pr-10 text-sm"
                        required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <span className="material-symbols-rounded text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                </div>
            </div>

            <div className="mt-1">
                <Button fullWidth type="submit" disabled={isLoading} className={role === UserRole.DRIVER ? '!bg-brand-teal !text-white !shadow-brand-teal/20' : '!bg-brand-purple !text-white !shadow-brand-purple/20'}>
                    {isLoading ? 'Logging in...' : 'Log In'}
                </Button>
            </div>
        </form>

        <div className="mt-auto text-center pb-2 space-y-2">
            <p className="text-[11px] text-gray-500">
                Don't have an account? <button onClick={goToRegister} className={`font-bold hover:underline ${role === UserRole.DRIVER ? 'text-brand-teal' : 'text-brand-purple'}`}>Sign up</button>
            </p>
            
            <div className="pt-2 border-t border-gray-100">
                <button 
                    onClick={handleDemoLogin}
                    className="w-full py-2 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-100 transition-colors"
                >
                    <Icon name="play_circle" className="text-sm" />
                    Enter Demo Mode
                </button>
                <p className="text-[8px] text-gray-400 mt-1">Populated with sample data for testing</p>
            </div>
        </div>
      </div>
    </div>
  );
};