import { memo } from "react";

/**
 * DeviceManagementSkeleton Component
 * Perfectly aligned with the DeviceManagement grid and spacing.
 */
const DeviceManagementSkeleton = memo(() => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. HEADER SECTION SKELETON */}
      <section className="space-y-3">
        <div className="h-12 w-80 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-5 w-[600px] bg-slate-100 rounded animate-pulse" />
      </section>

      {/* 2. SUMMARY SECTION CARDS SKELETON */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-slate-100 h-28">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
              <div className="h-8 w-12 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </section>

      {/* 3. TOOLBAR SKELETON */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm h-[74px]">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full flex-1">
          <div className="flex-1 h-10 bg-slate-50 rounded-xl animate-pulse" />
          <div className="w-full md:w-40 h-10 bg-slate-50 rounded-xl animate-pulse" />
          <div className="w-full md:w-48 h-10 bg-slate-50 rounded-xl animate-pulse" />
        </div>
      </section>

      {/* 4. DEVICE GRID SKELETON */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border-[1.5px] p-6 relative overflow-hidden flex flex-col items-center bg-white border-slate-100 h-[420px]">
            <div className="absolute top-4 left-4">
              <div className="bg-slate-50 border border-slate-100 w-12 h-12 rounded-xl animate-pulse" />
            </div>
            <div className="flex flex-col items-center w-full pt-12 space-y-8">
              <div className="h-8 w-32 bg-slate-50 rounded-full animate-pulse" />
              <div className="text-center space-y-3">
                <div className="h-10 w-48 bg-slate-100 rounded animate-pulse" />
                <div className="h-6 w-32 bg-slate-50 rounded animate-pulse mx-auto" />
              </div>
              <div className="w-full flex items-center gap-4">
                <div className="flex-1 h-[1.5px] bg-slate-100" />
                <div className="w-2 h-2 bg-slate-200 rounded-full" />
                <div className="flex-1 h-[1.5px] bg-slate-100" />
              </div>
              <div className="w-full h-14 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
});

DeviceManagementSkeleton.displayName = "DeviceManagementSkeleton";

export default DeviceManagementSkeleton;
