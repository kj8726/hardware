"use client";

export function CardSkeleton({ className = "" }) {
  return (
    <div className={`bg-brand-card border border-brand-border rounded-xl overflow-hidden animate-pulse ${className}`}>
      <div className="shimmer h-44" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-4 rounded-lg w-3/4" />
        <div className="shimmer h-3 rounded-lg w-full" />
        <div className="shimmer h-3 rounded-lg w-2/3" />
        <div className="flex justify-between mt-2">
          <div className="shimmer h-6 rounded-lg w-1/4" />
          <div className="shimmer h-4 rounded-full w-1/5" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="divide-y divide-brand-border">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-5 animate-pulse">
          <div className="shimmer w-12 h-12 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-4 rounded-lg w-1/3" />
            <div className="shimmer h-3 rounded-lg w-2/3" />
          </div>
          <div className="shimmer h-6 rounded-full w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-brand-card border border-brand-border rounded-xl p-5 animate-pulse">
          <div className="shimmer h-8 rounded-lg w-1/2 mb-2" />
          <div className="shimmer h-3 rounded-lg w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-brand-orange rounded-sm flex items-center justify-center animate-pulse">
          <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth={2.5}>
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-brand-orange rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
