import { memo } from "react";
import { DeviceCardSkeleton } from "./DeviceCardSkeleton";

/**
 * ResidentMonitorSkeleton Component
 * Perfectly aligned with the ResidentRealTimeMonitor grid and widget architecture.
 */
const ResidentMonitorSkeleton = memo(() => {
  return (
    <div className="animate-fade-in antialiased space-y-0">
      {/* 1. PAGE HEADER SKELETON */}
      <section className="pt-10 pb-6 border-b border-outline-variant/10 mb-10">
        <div className="space-y-3">
          <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-5 w-80 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </section>

      {/* 2. BENTO GRID SKELETON */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT COLUMN: Summary & Alerts (col-span-4) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-10">
          {/* Total Devices Card Skeleton */}
          <div className="h-44 w-full bg-white rounded-2xl shadow-sm border border-slate-50 p-8 flex items-center justify-between animate-pulse">
            <div className="space-y-4">
              <div className="h-3 w-20 bg-slate-100 rounded" />
              <div className="h-10 w-12 bg-slate-200 rounded" />
            </div>
            <div className="h-16 w-32 bg-slate-50 rounded-lg" />
          </div>

          {/* Recent Alerts Feed Skeleton */}
          <div className="h-[400px] w-full bg-white rounded-xl shadow-sm border border-slate-50 flex flex-col animate-pulse">
            <div className="p-6 border-b border-slate-50">
              <div className="h-4 w-32 bg-slate-200 rounded" />
            </div>
            <div className="p-6 space-y-4 flex-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg border border-slate-50">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-2 w-full bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Device Cards & CTA (col-span-8) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-10">
          {/* Provision Device Card Skeleton (Horizontal CTA) */}
          <div className="h-28 w-full bg-white rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between px-10 animate-pulse">
            <div className="space-y-3">
              <div className="h-5 w-48 bg-slate-200 rounded" />
              <div className="h-3 w-64 bg-slate-100 rounded" />
            </div>
            <div className="h-12 w-40 bg-slate-200 rounded-xl" />
          </div>

          {/* DEVICE GRID SKELETON */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2, 3, 4].map((i) => (
              <DeviceCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

ResidentMonitorSkeleton.displayName = "ResidentMonitorSkeleton";

export default ResidentMonitorSkeleton;
