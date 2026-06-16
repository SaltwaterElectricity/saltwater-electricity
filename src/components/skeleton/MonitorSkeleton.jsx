import { memo } from "react";

/**
 * MonitorSkeleton Component
 * Perfectly aligned with the AdminRealTimeMonitor grid and spacing.
 */
const MonitorSkeleton = memo(() => {
  return (
    <div className="flex flex-col h-full relative overflow-hidden space-y-0 animate-in fade-in duration-700">
      {/* 1. HEADER SECTION SKELETON */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-6 w-16 bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      {/* 2. TOP SUMMARY CARDS SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center h-[108px]">
            <div className="w-14 h-14 bg-slate-100 rounded-full mr-6 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex items-end space-x-1 h-12 ml-4 shrink-0">
               {[1, 2, 3, 4, 5, 6].map((j) => (
                 <div key={j} className="w-1.5 h-full bg-slate-50 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 60}%` }} />
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. BOTTOM SUMMARY CARDS SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex items-center h-[98px]">
            <div className="w-12 h-12 bg-slate-100 rounded-xl mr-4 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex items-end space-x-1 h-8 ml-2">
               {[1, 2, 3, 4].map((j) => (
                 <div key={j} className="w-1 h-full bg-slate-50 rounded-full animate-pulse" style={{ height: `${30 + Math.random() * 50}%` }} />
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* 4. FILTERS SKELETON */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <div className="flex-1 w-full h-10 bg-slate-100 rounded-xl animate-pulse" />
        <div className="w-full md:w-[160px] h-10 bg-slate-50 rounded-xl animate-pulse" />
        <div className="w-full md:w-[140px] h-10 bg-slate-50 rounded-xl animate-pulse" />
      </div>

      {/* 5. DEVICE LIST SKELETON */}
      <div className="space-y-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white px-6 py-4 rounded-[24px] border border-gray-100 flex items-center h-[100px]">
            <div className="w-[28%] flex items-center space-x-3 pr-4 border-r border-gray-100 h-full">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                <div className="h-2 w-20 bg-slate-50 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex-1 flex items-center px-8 space-x-12">
               {[1, 2].map((j) => (
                 <div key={j} className="w-40 space-y-2">
                   <div className="h-2 w-12 bg-slate-100 rounded animate-pulse" />
                   <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                   <div className="flex items-end space-x-1 h-8">
                      {[1, 2, 3, 4, 5, 6].map((k) => (
                        <div key={k} className="flex-1 h-full bg-slate-50 rounded-sm animate-pulse" style={{ height: `${20 + Math.random() * 70}%` }} />
                      ))}
                   </div>
                 </div>
               ))}
            </div>
            <div className="flex items-center">
              <div className="w-20 space-y-1">
                <div className="h-2.5 w-12 bg-slate-100 rounded animate-pulse" />
                <div className="h-2 w-10 bg-slate-50 rounded animate-pulse" />
              </div>
              <div className="ml-6 w-20 h-9 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

MonitorSkeleton.displayName = "MonitorSkeleton";

export default MonitorSkeleton;
