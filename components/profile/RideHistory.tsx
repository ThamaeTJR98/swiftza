
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { RideHistoryItem, AppView } from '../../types';
import { useApp } from '../../context/AppContext';
import { Icon } from '../Icons';
import { ReportProblemModal } from './ReportProblemModal';

interface RideHistoryProps {
    onBack: () => void;
    history: RideHistoryItem[];
}

export const RideHistory: React.FC<RideHistoryProps> = ({ onBack, history }) => {
    const { navigate } = useApp();
    const [filter, setFilter] = useState<'ALL' | 'ERRAND' | 'MOVE'>('ALL');
    const [selectedRideForDispute, setSelectedRideForDispute] = useState<string | null>(null);

    // Heuristic to determine type from mock data since type isn't stored in history item yet
    const getServiceType = (item: RideHistoryItem): 'ERRAND' | 'MOVE' => {
        const text = (item.pickup + ' ' + item.dropoff + ' ' + item.driver).toLowerCase();
        if (text.includes('truck') || text.includes('move') || text.includes('furniture')) return 'MOVE';
        return 'ERRAND';
    };

    const filteredHistory = history.filter(item => {
        if (filter === 'ALL') return true;
        return getServiceType(item) === filter;
    });

    const getTheme = (type: string) => {
        switch (type) {
            case 'ERRAND':
                return {
                    bg: 'bg-indigo-50',
                    text: 'text-indigo-600',
                    icon: 'shopping_bag',
                    label: 'Errand'
                };
            case 'MOVE':
                return {
                    bg: 'bg-orange-50',
                    text: 'text-orange-600',
                    icon: 'local_shipping',
                    label: 'Move'
                };
            default: // RIDE
                return {
                    bg: 'bg-primary/10',
                    text: 'text-primary',
                    icon: 'local_taxi',
                    label: 'Ride'
                };
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col bg-white font-sans animate-slide-up h-[100dvh]">
            
            {/* 1. Compact Header & Filters */}
            <div className="shrink-0 bg-white pt-safe-top z-20 border-b border-slate-50 shadow-sm">
                <div className="flex items-center justify-between px-4 py-2 h-[56px]">
                    <button 
                        onClick={onBack} 
                        className="size-9 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors active:scale-90"
                    >
                        <Icon name="arrow_back_ios_new" className="text-lg" />
                    </button>
                    <h2 className="text-slate-900 text-sm font-bold uppercase tracking-wide">Activity History</h2>
                    <div className="size-9"></div> {/* Spacer */}
                </div>
                
                {/* Compact Filter Tabs */}
                <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
                    {['ALL', 'ERRAND', 'MOVE'].map((f) => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`flex h-7 shrink-0 items-center justify-center rounded-full px-3 text-[10px] font-bold uppercase tracking-wide transition-all border ${
                                filter === f 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {f === 'ALL' ? 'All' : f === 'ERRAND' ? 'Errands' : 'Moves'}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. Compact List Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-slate-50/50 pb-40 md:pb-24">
                {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-300">
                        <Icon name="history" className="text-4xl mb-2 opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70">No activity yet</p>
                    </div>
                ) : (
                    filteredHistory.map((item) => {
                        const type = getServiceType(item);
                        const theme = getTheme(type);
                        const isCancelled = item.status === 'Cancelled';
                        
                        return (
                            <div key={item.id} className="group bg-white rounded-2xl p-3 border border-slate-100 shadow-sm active:scale-[0.98] transition-all flex items-center gap-3">
                                {/* Compact Icon */}
                                <div className={`size-10 shrink-0 flex items-center justify-center rounded-xl ${theme.bg} ${theme.text}`}>
                                    <Icon name={theme.icon} className="text-lg" />
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="text-xs font-bold text-slate-900 truncate pr-2">
                                            {item.dropoff.split(',')[0]}
                                        </h4>
                                        {isCancelled && (
                                            <span className="bg-red-50 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                Cancelled
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] text-slate-500 font-medium truncate">{item.date}</p>
                                        <p className={`text-xs font-extrabold ${isCancelled ? 'text-slate-300 line-through' : 'text-slate-900'}`}>
                                            R{item.price.toFixed(0)}
                                        </p>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex flex-col items-center gap-2">
                                    <Icon name="chevron_right" className="text-slate-200 group-hover:text-slate-400 text-lg" />
                                    {!isCancelled && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRideForDispute(item.id);
                                            }}
                                            className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            title="Report Problem"
                                        >
                                            <Icon name="report" className="text-base" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {selectedRideForDispute && (
                <ReportProblemModal 
                    rideId={selectedRideForDispute} 
                    onClose={() => setSelectedRideForDispute(null)} 
                />
            )}

            {/* 3. Floating Bottom Button - Lifted to clear BottomNav */}
            <div className="absolute bottom-24 md:bottom-6 left-0 right-0 px-6 z-30 pointer-events-none">
                <button 
                    onClick={() => navigate(AppView.HOME)}
                    className="pointer-events-auto w-full h-12 bg-primary text-slate-900 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform hover:brightness-105"
                >
                    <Icon name="add_circle" className="text-lg" />
                    Request New Service
                </button>
            </div>
        </div>,
        document.body
    );
};
