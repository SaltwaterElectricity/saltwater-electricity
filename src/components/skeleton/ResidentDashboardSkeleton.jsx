import { memo } from "react";
import { Footer } from "../../layout";

/**
 * ResidentDashboardSkeleton Component
 * Perfectly aligned with the ResidentDashboard grid and spacing for seamless hydration.
 */
const ResidentDashboardSkeleton = memo(() => {
  return (
    <div className="space-y-stack-lg animate-in fade-in duration-700 antialiased">
      {/* 1. WELCOME SECTION SKELETON */}
      <div className="mb-stack-lg">
        <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-6 w-[450px] bg-slate-100 rounded-lg animate-pulse mt-2" />
      </div>

      {/* 2. KPI SECTION SKELETON (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 flex items-center shadow-sm border border-slate-100 h-32"
          >
            <div className="w-14 h-14 rounded-full bg-slate-100 animate-pulse mr-6 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-7 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. PERFORMANCE & OVERVIEW SECTION SKELETON (2 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 h-[400px] shadow-sm border border-slate-100 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse" />
            </div>
            <div className="flex-1 bg-slate-50/50 rounded-xl animate-pulse" />
            <div className="h-10 w-full bg-slate-50 rounded-xl mt-6 animate-pulse" />
          </div>
        ))}
      </div>

      {/* 4. STATUS & ALERTS SECTION SKELETON (2 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Device Status Widget Skeleton */}
        <div className="bg-white rounded-2xl p-6 h-[400px] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse" />
          </div>
          <div className="flex-1 space-y-4 overflow-hidden">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-slate-50 bg-slate-50/30 space-y-4"
              >
                <div className="flex justify-between">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                      <div className="h-2 w-16 bg-slate-100 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-12 bg-white rounded-xl border border-slate-50 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="h-12 w-full bg-slate-100 rounded-xl mt-6 animate-pulse" />
        </div>

        {/* Recent Alerts Feed Skeleton */}
        <div className="bg-white rounded-2xl p-6 h-[400px] shadow-sm border border-slate-100 flex flex-col">
          <div className="h-4 w-32 bg-slate-200 rounded mb-8 animate-pulse" />
          <div className="flex-1 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-lg border border-slate-50">
                <div className="w-10 h-10 rounded-lg bg-slate-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
                    <div className="h-2 w-12 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-10 w-full bg-slate-50 rounded-lg mt-6 animate-pulse" />
        </div>
      </div>

      {/* 5. FOOTER SKELETON */}
      <div className="pt-8 opacity-20">
        <Footer />
      </div>
    </div>
  );
});

ResidentDashboardSkeleton.displayName = "ResidentDashboardSkeleton";

export default ResidentDashboardSkeleton;
