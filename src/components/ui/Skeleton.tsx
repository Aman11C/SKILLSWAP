export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 border border-gray-300 ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="border-4 border-black bg-white p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-14 border-2 border-black" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4 border border-black" />
          <Skeleton className="h-3 w-1/2 border border-black" />
        </div>
      </div>
      <Skeleton className="h-16 w-full border border-black" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 border border-black" />
        <Skeleton className="h-6 w-16 border border-black" />
        <Skeleton className="h-6 w-16 border border-black" />
      </div>
    </div>
  );
}

export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-8 h-8 border-4 border-black border-t-transparent animate-spin" />
      <p className="text-xs font-mono font-bold text-slate-500">{text}</p>
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="border-4 border-black bg-white p-12 text-center font-mono space-y-2">
      <div className="flex justify-center text-slate-300">{icon}</div>
      <h3 className="text-lg font-black uppercase">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
    </div>
  );
}
