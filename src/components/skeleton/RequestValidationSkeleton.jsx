import { memo } from "react";

/**
 * RequestValidationSkeleton Component
 * Perfectly aligned with the RequestManagement (Request Validation) grid and spacing.
 */
const RequestValidationSkeleton = memo(() => {
  return (
    <div className="w-full flex flex-col items-start space-y-8 antialiased animate-in fade-in duration-700">
      {/* 1. HEADER SECTION SKELETON */}
      <div className="w-full flex flex-col text-left space-y-2">
        <div className="h-9 w-80 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-4 w-[500px] bg-slate-100 rounded animate-pulse" />
      </div>

      {/* 2. STATISTIC SUMMARY CARDS SKELETON */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 h-[140px] flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
              <div className="h-2 w-20 bg-slate-50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. FILTERS & TABLE SKELETON */}
      <div className="w-full space-y-8">
        {/* Filter Bar Skeleton */}
        <div className="bg-white p-4 rounded-[20px] shadow-sm border border-[#F1F5F9] flex flex-wrap items-center justify-between gap-4 h-[74px]">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex-1 max-w-md h-10 bg-slate-50 rounded-xl animate-pulse" />
            <div className="w-40 h-10 bg-slate-100 rounded-xl animate-pulse" />
            <div className="w-32 h-10 bg-slate-100 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-[20px] shadow-sm border border-[#F1F5F9] overflow-hidden">
          <div className="bg-[#f2f3ff]/30 h-14 border-b border-outline-variant/20 flex items-center px-6">
            <div className="flex-1 grid grid-cols-5 gap-4">
               {[1, 2, 3, 4, 5].map((i) => (
                 <div key={i} className="h-3 w-24 bg-slate-200/50 rounded animate-pulse" />
               ))}
            </div>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center h-[73px]">
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-2 w-32 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                  <div className="flex justify-center">
                    <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                    <div className="h-2 w-16 bg-slate-50 rounded animate-pulse" />
                  </div>
                  <div className="flex justify-end">
                    <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

RequestValidationSkeleton.displayName = "RequestValidationSkeleton";

export default RequestValidationSkeleton;
