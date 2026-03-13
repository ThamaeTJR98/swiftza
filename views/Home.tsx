import React, { useEffect, useState } from 'react';
import { AppView } from '../types';
import { BottomSheet } from '../components/BottomSheet';
import { useApp } from '../context/AppContext';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { Icon } from '../components/Icons';
import { RunnerProfileModal } from '../components/map/RunnerProfileModal';
import { AddPlaceModal } from '../components/AddPlaceModal';

export const Home: React.FC = () => {
    const { navigate, serviceType, setServiceType, user, setInitialRequestQuery, selectedRunner, setSelectedRunner, savedPlaces, setInitialDropoff } = useApp();
    const { isListening, transcript, startListening, setTranscript } = useSpeechToText();
    const [isSheetOpen, setIsSheetOpen] = useState(true);
    const [showAddPlaceModal, setShowAddPlaceModal] = useState<string | null>(null); // 'Home', 'Work', etc.

    const handleQuickLink = (placeName: string) => {
        const place = savedPlaces.find(p => p.name.toLowerCase() === placeName.toLowerCase());
        if (place) {
            setInitialDropoff({ address: place.address, lat: place.lat, lng: place.lng });
            navigate(AppView.REQUEST_RIDE);
        } else {
            setShowAddPlaceModal(placeName);
        }
    };

    const handlePlaceAdded = () => {
        const newPlaceName = showAddPlaceModal;
        setShowAddPlaceModal(null);
        if (newPlaceName) {
            // We need to wait for the state to update or just use the data we just saved
            // Actually, addSavedPlace updates the state, but we can't be sure it's immediate.
            // Better to let the user click again or handle it in useEffect.
            // But the user wants to be directed immediately.
        }
    };

  useEffect(() => {
    if (transcript) {
        setInitialRequestQuery(transcript);
        setTranscript('');
        navigate(AppView.REQUEST_RIDE);
    }
  }, [transcript]);

  const handleSavedPlaceClick = (address: string) => {
      setInitialRequestQuery(address);
      navigate(AppView.REQUEST_RIDE);
  };

  return (
    <div className="w-full h-full pointer-events-none relative bg-transparent">
      
      {selectedRunner && (
        <div className="pointer-events-auto relative z-[70]">
          <RunnerProfileModal runner={selectedRunner} onClose={() => setSelectedRunner(null)} />
        </div>
      )}

      {/* Top Profile Overlay */}
      <div className="fixed top-0 left-0 right-0 z-20 px-4 pt-safe-top mt-4 pointer-events-none">
        <div className="flex justify-between items-center max-w-md mx-auto pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/50">
             <div className="w-7 h-7 bg-brand-teal rounded-lg flex items-center justify-center">
                 <Icon name="local_taxi" className="text-white text-sm" />
             </div>
             <span className="font-black text-sm text-slate-800 tracking-tight">SwiftZA</span>
          </div>
          
          <div 
            className="bg-white/90 backdrop-blur-xl pl-1 pr-4 py-1 rounded-full flex items-center gap-2 shadow-lg border border-white/50 cursor-pointer" 
            onClick={() => navigate(AppView.PROFILE)}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white">
               <img 
                 src={user?.isDemo ? "https://i.pravatar.cc/100?img=11" : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"} 
                 alt="Profile" 
                 className="w-full h-full object-cover" 
               />
            </div>
            <span className="font-bold text-xs text-slate-800">Hello, {user?.name ? user.name.split(' ')[0] : 'Rider'}</span>
          </div>
        </div>
      </div>

      {/* Main Interaction Sheet */}
      <div className="pointer-events-none h-full">
        <BottomSheet isOpen={isSheetOpen} onToggle={setIsSheetOpen} collapsedIcon="search">
            <div className="px-6 pt-2 pb-nav md:pb-8">
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {['errand', 'move'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setServiceType(type as any)}
                            className={`flex flex-col items-center justify-center h-16 rounded-2xl transition-all active:scale-95 border-2 ${serviceType === type ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-500'}`}
                        >
                            <Icon name={type === 'errand' ? 'directions_run' : 'local_shipping'} className={`text-xl mb-0.5 ${serviceType === type ? 'text-brand-teal' : 'text-slate-400'}`} />
                            <span className="font-bold text-[10px] uppercase tracking-wide">{type}</span>
                        </button>
                    ))}
                </div>

                <div 
                    onClick={() => navigate(AppView.REQUEST_RIDE)}
                    className="bg-slate-100 rounded-2xl p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-200 transition-colors mb-4 border border-transparent hover:border-slate-300"
                >
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-900">
                        <Icon name="search" className="text-lg" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">SwiftZA Errands & Moves</p>
                        <p className="font-bold text-slate-800 text-sm">
                            {serviceType === 'move' ? 'What are we moving?' : 'What can we do for you?'}
                        </p>
                    </div>
                    <button 
                        className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}
                        onClick={(e) => { e.stopPropagation(); startListening(); }}
                    >
                        <Icon name="mic" className="text-lg" />
                    </button>
                </div>

                 <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                     <button onClick={() => handleQuickLink('Home')} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-full shrink-0 shadow-sm active:scale-95 hover:bg-slate-50 transition-colors">
                         <Icon name="home" className="text-slate-400 text-sm" />
                         <span className="font-bold text-xs text-slate-600">Home</span>
                     </button>
                     <button onClick={() => handleQuickLink('Work')} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-full shrink-0 shadow-sm active:scale-95 hover:bg-slate-50 transition-colors">
                         <Icon name="work" className="text-slate-400 text-sm" />
                         <span className="font-bold text-xs text-slate-600">Work</span>
                     </button>
                     <button onClick={() => navigate(AppView.SAVED_PLACES)} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-full shrink-0 shadow-sm active:scale-95 hover:bg-slate-50 transition-colors">
                         <Icon name="add" className="text-slate-400 text-sm" />
                         <span className="font-bold text-xs text-slate-600">Add</span>
                     </button>
                 </div>
             </div>
             {showAddPlaceModal && (
                 <AddPlaceModal 
                     placeName={showAddPlaceModal} 
                     onClose={() => setShowAddPlaceModal(null)} 
                     onSuccess={handlePlaceAdded} 
                 />
             )}
        </BottomSheet>
      </div>
    </div>
  );
};