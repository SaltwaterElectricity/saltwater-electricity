import { memo } from "react";
import { cn } from "../../utils/cn";

/**
 * SidebarSkeleton Component
 * Mimics the vertical navigation structure for smooth initial hydration.
 */
const SidebarSkeleton = memo(({ isCollapsed = false }) => {
  return (
    <aside
      className={cn(
        "h-screen transition-all duration-300 ease-in-out fixed left-0 top-0 z-50 shadow-xl flex flex-col",
        "bg-[#191b24] border-r border-white/5 text-white hidden md:flex overflow-hidden",
        isCollapsed ? "w-16 py-2 px-0" : "w-64 py-2 px-2"
      )}
    >
      {/* 1. BRANDING SKELETON */}
      <div className={cn("h-16 flex items-center mb-8", isCollapsed ? "justify-center" : "px-4")}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl animate-pulse shrink-0" />
          {!isCollapsed && (
            <div className="space-y-2">
              <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-2 w-20 bg-blue-500/20 rounded animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* 2. NAVIGATION SKELETON */}
      <div className={cn("flex-1 space-y-4", isCollapsed ? "px-2" : "px-4")}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-6 h-6 bg-white/5 rounded animate-pulse shrink-0" />
            {!isCollapsed && <div className="h-3 w-full bg-white/5 rounded animate-pulse" />}
          </div>
        ))}
      </div>

      {/* 3. PROFILE FOOTER SKELETON */}
      <div className="mt-auto pt-4 space-y-4 border-t border-white/5 pb-4">
        {!isCollapsed && (
          <div className="px-2">
            <div className="rounded-xl p-3 flex items-center gap-3 bg-white/5 border border-white/5">
              <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          </div>
        )}
        <div className={cn("px-2", isCollapsed ? "flex justify-center" : "")}>
          <div
            className={cn(
              "h-10 bg-red-500/5 rounded-xl animate-pulse",
              isCollapsed ? "w-10" : "w-full"
            )}
          />
        </div>
      </div>
    </aside>
  );
});

SidebarSkeleton.displayName = "SidebarSkeleton";

export default SidebarSkeleton;
