import React from 'react';

interface BrutalistButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'blue' | 'magenta' | 'white' | 'black';
  size?: 'sm' | 'md' | 'lg';
  shadowSize?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function BrutalistButton({
  variant = 'yellow',
  size = 'md',
  shadowSize = 'md',
  children,
  className = '',
  ...props
}: BrutalistButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'yellow':
        return 'bg-[#bef264] text-black hover:bg-[#d9f99d]';
      case 'blue':
        return 'bg-[#2563eb] text-white hover:bg-blue-700';
      case 'magenta':
        return 'bg-[#db2777] text-white hover:bg-pink-700';
      case 'black':
        return 'bg-black text-white hover:bg-neutral-800';
      case 'white':
      default:
        return 'bg-white text-black hover:bg-slate-50';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs font-bold';
      case 'lg':
        return 'px-8 py-4 text-base md:text-lg font-black uppercase tracking-tight';
      case 'md':
      default:
        return 'px-5 py-2.5 text-sm font-bold';
    }
  };

  const getShadowStyles = () => {
    switch (shadowSize) {
      case 'sm':
        return 'shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)]';
      case 'lg':
        return 'shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_rgba(0,0,0,1)]';
      case 'md':
      default:
        return 'shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_rgba(0,0,0,1)]';
    }
  };

  return (
    <button
      className={`border-2 border-black inline-flex items-center justify-center gap-2 select-none uppercase transition-all font-mono tracking-tight duration-100 ${getVariantStyles()} ${getSizeStyles()} ${getShadowStyles()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
