import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
  icon?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "h-14 rounded-full font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-primary text-text-main hover:bg-[#20d87d] shadow-lg shadow-primary/20",
    secondary: "bg-white text-text-main shadow-soft border border-gray-100",
    outline: "bg-transparent border-2 border-gray-200 text-text-main hover:border-primary hover:text-primary",
    ghost: "bg-transparent text-text-sub hover:text-text-main hover:bg-gray-100/50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-rounded text-xl" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
};