import React from 'react';
import { useDriverCompliance } from '../../hooks/useDriverCompliance';
import { Icon } from '../Icons';

export const ComplianceBlocker: React.FC = () => {
    const { loading, isCompliant, blockingReason } = useDriverCompliance();

    if (loading || isCompliant) return null;

    return (
        <div className="absolute inset-0 z-50 bg-red-600/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-white text-center animate-fade-in">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Icon name="gpp_bad" className="text-5xl" />
            </div>
            
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Account Suspended</h2>
            <p className="text-white/80 font-medium mb-8 leading-relaxed">
                {blockingReason || "You have outstanding compliance issues that prevent you from driving."}
            </p>

            <div className="bg-white/10 rounded-xl p-4 w-full max-w-xs border border-white/20 mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Icon name="info" className="text-yellow-300" />
                    <p className="text-xs font-bold uppercase tracking-wider text-yellow-300">Action Required</p>
                </div>
                <p className="text-xs text-left text-white/90">
                    Please upload valid documents via your Profile to restore access immediately.
                </p>
            </div>

            <button 
                onClick={() => window.location.href = '/profile'} // Simple redirect for now
                className="bg-white text-red-600 px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform"
            >
                Fix Issues Now
            </button>
        </div>
    );
};
