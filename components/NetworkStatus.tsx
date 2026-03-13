import React, { useState, useEffect } from 'react';

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-gray-900 text-white p-3 text-center animate-slide-up">
        <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-rounded text-red-500 animate-pulse">wifi_off</span>
            <span className="font-bold text-sm">You are offline. Reconnecting...</span>
        </div>
      </div>
    );
  }

  if (showBackOnline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-green-600 text-white p-3 text-center animate-slide-up">
        <div className="flex items-center justify-center gap-2">
            <span className="material-symbols-rounded">wifi</span>
            <span className="font-bold text-sm">Back online</span>
        </div>
      </div>
    );
  }

  return null;
};