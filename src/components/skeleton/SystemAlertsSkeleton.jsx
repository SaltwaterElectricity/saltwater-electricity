import { memo } from "react";

/**
 * SystemAlertsSkeleton Component
 * Perfectly aligned with the SystemAlerts grid and grouping logic.
 */
const SystemAlertsSkeleton = memo(() => {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      {/* 1. HEADER SECTION SKELETON */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="h-8 w-80 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="h-11 w-48 bg-white border border-slate-100 rounded-xl animate-pulse self-end md:self-auto" />
      </div>

      {/* 2. MAIN CONTAINER SKELETON */}
      <div className="bg-white rounded-[24px] shadow-[0px_12px_32px_-4px_rgba(10,46,255,0.04)] border border-outline-variant/30 overflow-hidden p-6 md:p-8 min-h-[600px]">
        {[1, 2].map((group) => (
          <div key={group} className="mb-10 last:mb-0">
            {/* Group Header Skeleton */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="flex-1 h-px bg-slate-50" />
            </div>

            {/* Notification Cards Skeleton */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-white border border-slate-50 rounded-xl"
                >
                  {/* Icon Skeleton */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse shrink-0" />

                  {/* Content Skeleton */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                  </div>

                  {/* Metadata Skeleton */}
                  <div className="flex items-center gap-2 h-4 w-20 bg-slate-50 rounded animate-pulse" />

                  {/* Badge Skeleton */}
                  <div className="md:ml-4 h-6 w-16 bg-slate-100 rounded-lg animate-pulse" />

                  {/* Button Skeleton */}
                  <div className="md:ml-4 h-10 w-24 bg-slate-50 rounded-lg border border-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SystemAlertsSkeleton.displayName = "SystemAlertsSkeleton";

export default SystemAlertsSkeleton;
