
import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

interface BottomSheetProps {
  children: React.ReactNode;
  title?: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  className?: string;
  maxHeight?: string;
  collapsedIcon?: string;
  collapsedColorClass?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ 
  children, 
  title, 
  isOpen = true, 
  onToggle,
  className = '',
  maxHeight = 'max-h-[85vh]',
  collapsedIcon = 'search',
  collapsedColorClass = 'bg-primary text-white shadow-glow'
}) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);

  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <>
      {/* Expanded Sheet Container */}
      <div 
        className={`
          fixed z-30 transition-all duration-500 ease-in-out shadow-[0_-8px_30px_rgba(0,0,0,0.12)] bg-white
          pointer-events-auto
          
          /* Mobile: Bottom Sheet */
          bottom-0 left-0 right-0 
          ${isExpanded ? 'translate-y-0' : 'translate-y-[120%]'}
          rounded-t-[2rem]

          /* Desktop: Floating Side Panel */
          md:top-4 md:left-4 md:bottom-auto md:right-auto md:w-[400px] 
          md:translate-y-0 md:rounded-3xl
          ${isExpanded ? 'md:translate-x-0' : 'md:-translate-x-[calc(100%+20px)]'}

          ${className}
        `}
      >
        {/* Handle / Header */}
        <div 
          className="min-h-[2.5rem] flex items-center justify-center cursor-pointer relative border-b border-gray-100/50"
          onClick={handleToggle}
        >
          {/* Mobile Handle Indicator */}
          <div className="md:hidden w-12 h-1 bg-gray-200 rounded-full absolute top-3"></div>
          
          {/* Desktop Collapse Toggle */}
          <button className="hidden md:flex absolute -right-12 top-4 w-10 h-10 bg-white shadow-md rounded-full items-center justify-center text-text-main hover:bg-gray-50 pointer-events-auto">
              <span className="material-symbols-rounded">
                  {isExpanded ? 'chevron_left' : 'chevron_right'}
              </span>
          </button>

          {title && (
              <h3 className="font-bold text-text-main pt-4 md:pt-0 pb-2">{title}</h3>
          )}
        </div>

        {/* Content Area */}
        <div className={`overflow-y-auto ${maxHeight} scroll-smooth pb-safe`}>
          {children}
        </div>
      </div>

      {/* Floating Collapsed Button (FAB) - High Contrast Version */}
      <button
        onClick={handleToggle}
        className={`
            fixed bottom-28 right-4 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center 
            transition-all duration-300 ease-in-out border border-white/40 backdrop-blur-sm active:scale-95 pointer-events-auto
            ${isExpanded ? 'scale-0 opacity-0 translate-y-12' : 'scale-100 opacity-100 translate-y-0 hover:scale-110'}
            ${collapsedColorClass}
        `}
      >
         <div className={`${!isExpanded ? 'animate-bounce' : ''}`}>
            <Icon name={collapsedIcon} className="text-2xl" />
         </div>
      </button>
    </>
  );
};
