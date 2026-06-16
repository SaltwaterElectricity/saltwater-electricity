import { memo } from "react";

/**
 * DashboardSkeleton Component
 * Mimics the layout of ResidentDashboard for smooth hydration.
 */
const DashboardSkeleton = memo(() => {
  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500">
      {/* Welcome Section Skeleton */}
      <div className="mb-stack-lg space-y-2">
        <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-6 w-96 bg-slate-100 rounded-lg animate-pulse" />
      </div>

      {/* KPI Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 flex items-center shadow-sm border border-slate-100 h-32"
          >
            <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse mr-6" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-12 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 h-[400px] shadow-sm border border-slate-100 flex flex-col"
          >
            <div className="flex justify-between mb-8">
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse" />
            </div>
            <div className="flex-1 bg-slate-50 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>

      {/* Bottom Widgets Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 h-[400px] shadow-sm border border-slate-100 flex flex-col"
          >
            <div className="h-4 w-24 bg-slate-200 rounded mb-6 animate-pulse" />
            <div className="flex-1 space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

DashboardSkeleton.displayName = "DashboardSkeleton";

export default DashboardSkeleton;
