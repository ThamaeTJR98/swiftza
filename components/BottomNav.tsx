import React from 'react';
import { AppView, UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { Icon } from './Icons';

interface BottomNavProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  userRole: UserRole;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView, userRole }) => {
  const { navigate } = useApp();

  // Define nav items based on role
  const navItems = userRole === UserRole.DRIVER 
    ? [
        { view: AppView.DRIVER_HOME, icon: 'explore', label: 'Map' },
        { view: AppView.WALLET, icon: 'account_balance_wallet', label: 'Wallet' },
        { view: AppView.PROFILE, icon: 'person_outline', label: 'Profile' },
      ]
    : [
        { view: AppView.HOME, icon: 'home', label: 'Home' },
        { view: AppView.WALLET, icon: 'account_balance_wallet', label: 'Wallet' },
        { view: AppView.PROFILE, icon: 'person_outline', label: 'Profile' },
      ];

  const handleNavClick = (view: AppView) => {
    navigate(view, true);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 ios-blur border-t border-gray-200 pt-2 px-6 z-50 md:hidden pb-safe">
      <div className="flex justify-between items-start h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => handleNavClick(item.view)}
              className={`flex flex-col items-center justify-center w-16 gap-1 transition-all duration-200 active:scale-90 ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
               <Icon name={item.icon} className="text-[28px]" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                  {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};