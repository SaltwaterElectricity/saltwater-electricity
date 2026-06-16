import { memo } from "react";

/**
 * AdminDashboardSkeleton Component
 * Perfectly aligned with the AdminDashboard grid and spacing.
 */
const AdminDashboardSkeleton = memo(() => {
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 1. METRICS GRID SKELETON */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-50 h-32 flex items-center justify-between"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. PERFORMANCE & HEALTH SECTION SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9">
          <div className="bg-white rounded-[20px] p-6 h-[450px] shadow-sm border border-slate-50 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-slate-100 rounded-xl animate-pulse" />
            </div>
            <div className="flex-1 bg-slate-50/50 rounded-2xl animate-pulse" />
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[20px] p-6 h-[450px] shadow-sm border border-slate-50 flex flex-col items-center justify-center space-y-8">
            <div className="w-48 h-48 rounded-full border-[12px] border-slate-100 flex items-center justify-center animate-pulse">
              <div className="h-8 w-20 bg-slate-200 rounded" />
            </div>
            <div className="w-full space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. ALERTS & USERS SECTION SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[20px] p-6 h-[400px] shadow-sm border border-slate-50 flex flex-col">
            <div className="h-5 w-32 bg-slate-200 rounded mb-6 animate-pulse" />
            <div className="flex-1 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-[20px] p-6 h-[200px] shadow-sm border border-slate-50">
            <div className="h-5 w-40 bg-slate-200 rounded mb-4 animate-pulse" />
            <div className="h-24 bg-slate-50 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[20px] p-6 h-[300px] shadow-sm border border-slate-50">
            <div className="h-5 w-48 bg-slate-200 rounded mb-8 animate-pulse" />
            <div className="h-40 bg-slate-50 rounded-xl animate-pulse" />
          </div>
          <div className="bg-white rounded-[20px] p-6 h-[300px] shadow-sm border border-slate-50">
            <div className="h-5 w-32 bg-slate-200 rounded mb-6 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

AdminDashboardSkeleton.displayName = "AdminDashboardSkeleton";

export default AdminDashboardSkeleton;
