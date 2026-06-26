import React from 'react';
import { AlertOctagon, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="bg-[#f87171] border-4 border-black p-4 font-mono text-black font-bold flex items-center justify-between gap-3 shadow-[4px_4px_0px_#000] mx-auto my-4 max-w-4xl w-full">
      <div className="flex items-center gap-3">
        <div className="bg-white border-2 border-black p-1">
          <AlertOctagon className="w-5 h-5 text-red-600" />
        </div>
        <span className="text-xs">{message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="border-2 border-black bg-white p-1 hover:bg-neutral-100 transition-colors"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
