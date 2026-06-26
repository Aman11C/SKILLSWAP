import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Synchronizing with SkillSwap Core...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-[#f4f4f0] flex flex-col items-center justify-center p-6 z-50 font-mono">
      <div className="bg-white border-4 border-black p-8 max-w-md w-full text-center shadow-[8px_8px_0px_#000]">
        <div className="relative w-16 h-16 mx-auto mb-6">
          {/* Animated Spinner with Brutalist Borders */}
          <div className="absolute inset-0 border-4 border-black animate-spin rounded-none border-t-[#bef264]" />
          <div className="absolute inset-2 border-4 border-black border-dashed rounded-none" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight text-black mb-2">LOADING</h2>
        <p className="text-xs font-bold text-slate-600 animate-pulse">{message}</p>
      </div>
    </div>
  );
}
