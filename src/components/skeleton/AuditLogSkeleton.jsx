import { memo } from "react";

/**
 * AuditLogSkeleton Component
 * Perfectly aligned with the AuditLogPage grid and spacing.
 */
const AuditLogSkeleton = memo(() => {
  return (
    <div className="w-full space-y-4 antialiased font-sans animate-in fade-in duration-700">
      {/* 1. HEADER SECTION SKELETON */}
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
        <div className="space-y-2 mt-8">
          <div className="h-9 w-64 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-[600px] bg-slate-100 rounded animate-pulse" />
        </div>
      </div>

      {/* 2. METRICS SECTION SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-50 flex items-center justify-between h-[122px]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                <div className="h-7 w-12 bg-slate-200 rounded animate-pulse" />
                <div className="h-2 w-16 bg-slate-50 rounded animate-pulse" />
              </div>
            </div>
            <div className="w-[70px] h-[70px] rounded-full border-4 border-slate-50 animate-pulse flex items-center justify-center">
               <div className="h-3 w-8 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. FILTERS SKELETON */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full h-12 bg-slate-50 rounded-xl animate-pulse" />
          <div className="w-full lg:w-[240px] h-12 bg-slate-50 rounded-xl animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-4 items-end">
           {[1, 2, 3, 4].map((i) => (
             <div key={i} className="flex-1 min-w-[150px] w-full space-y-2">
               <div className="h-2.5 w-16 bg-slate-100 rounded ml-1 animate-pulse" />
               <div className="h-11 w-full bg-slate-50 rounded-xl animate-pulse" />
             </div>
           ))}
           <div className="h-4 w-24 bg-slate-100 rounded mb-3 ml-4 animate-pulse" />
        </div>
      </div>

      {/* 4. TABLE SKELETON */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-50">
          <div className="h-6 w-40 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="overflow-x-auto">
          <div className="h-12 bg-slate-50 border-b border-slate-50 flex items-center px-6">
            <div className="flex-1 grid grid-cols-8 gap-4">
               {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                 <div key={i} className="h-2.5 w-20 bg-slate-200/50 rounded animate-pulse" />
               ))}
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center h-[73px]">
                <div className="flex-1 grid grid-cols-8 gap-4 items-center">
                  <div className="flex items-center gap-3 col-span-1">
                    <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
                    <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-16 bg-slate-50 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-slate-50 rounded animate-pulse" />
                  <div className="h-6 w-16 bg-slate-50 rounded-full animate-pulse" />
                  <div className="h-6 w-16 bg-slate-50 rounded-full animate-pulse" />
                  <div className="h-3 w-24 bg-slate-50 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-slate-50 rounded animate-pulse text-center" />
                  <div className="h-8 w-8 bg-slate-50 rounded-lg animate-pulse justify-self-end" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. PAGINATION SKELETON */}
      <div className="flex items-center justify-between px-2">
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="flex items-center gap-2">
           <div className="h-10 w-10 bg-slate-50 rounded-lg animate-pulse" />
           <div className="h-10 w-24 bg-slate-50 rounded-lg animate-pulse" />
           <div className="h-10 w-10 bg-slate-50 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
});

AuditLogSkeleton.displayName = "AuditLogSkeleton";

export default AuditLogSkeleton;
