import { memo } from "react";

/**
 * ResidentManagementSkeleton Component
 * Perfectly aligned with the ResidentManagement grid and spacing.
 */
const ResidentManagementSkeleton = memo(() => {
  return (
    <div className="w-full antialiased space-y-8 animate-in fade-in duration-700">
      {/* 1. HEADER SECTION SKELETON */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
      </div>

      {/* 2. STATS SECTION SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-50 flex items-center h-[108px]">
            <div className="w-14 h-14 bg-slate-100 rounded-xl mr-4 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex items-end gap-[3px] h-10 self-end mb-1">
               {[1, 2, 3, 4, 5].map((j) => (
                 <div key={j} className="w-1 bg-slate-50 rounded-t-sm animate-pulse" style={{ height: `${20 + Math.random() * 60}%` }} />
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. FILTERS SKELETON */}
      <div className="bg-white rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm border border-slate-100 h-[88px]">
        <div className="flex flex-1 flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full h-12 bg-slate-50 rounded-xl animate-pulse" />
          <div className="w-full lg:w-[180px] h-12 bg-slate-50 rounded-xl animate-pulse" />
          <div className="w-full lg:w-[160px] h-12 bg-slate-50 rounded-xl animate-pulse" />
        </div>
        <div className="w-full lg:w-[180px] h-12 bg-slate-100 rounded-xl animate-pulse" />
      </div>

      {/* 4. TABLE SKELETON */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <div className="h-14 bg-slate-50 border-b border-slate-100 flex items-center px-6">
          <div className="flex-1 grid grid-cols-5 gap-4">
             {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="h-3 w-20 bg-slate-200/50 rounded animate-pulse" />
             ))}
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center h-[81px]">
              <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                    <div className="h-2 w-32 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
                <div className="flex justify-end gap-2">
                  <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ResidentManagementSkeleton.displayName = "ResidentManagementSkeleton";

export default ResidentManagementSkeleton;
