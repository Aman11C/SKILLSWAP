import React from 'react';

interface BrutalistCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'white' | 'yellow' | 'blue' | 'magenta' | 'gray';
  className?: string;
  shadowSize?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  key?: React.Key;
}

export default function BrutalistCard({
  children,
  variant = 'white',
  className = '',
  shadowSize = 'md',
  onClick,
  ...props
}: BrutalistCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'yellow':
        return 'bg-[#bef264] text-black';
      case 'blue':
        return 'bg-[#2563eb] text-white';
      case 'magenta':
        return 'bg-[#db2777] text-white';
      case 'gray':
        return 'bg-[#f1f5f9] text-black border-slate-900';
      case 'white':
      default:
        return 'bg-white text-black';
    }
  };

  const getShadowStyles = () => {
    switch (shadowSize) {
      case 'sm':
        return 'shadow-[2px_2px_0px_rgba(0,0,0,1)]';
      case 'lg':
        return 'shadow-[8px_8px_0px_rgba(0,0,0,1)]';
      case 'md':
      default:
        return 'shadow-[4px_4px_0px_rgba(0,0,0,1)]';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`border-2 border-black p-5 relative overflow-hidden transition-all ${
        onClick ? 'cursor-pointer hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]' : ''
      } ${getVariantStyles()} ${getShadowStyles()} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
