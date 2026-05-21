export const UserTableSkeleton = () => (
  <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-sm overflow-hidden animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-surface-container-low border-b border-outline-variant/30 p-6 h-14" />
    
    <div className="divide-y divide-outline-variant/20">
      {["u1", "u2", "u3", "u4"].map((id) => (
        <div key={id} className="px-6 py-5 grid grid-cols-6 items-center gap-4">
          <div className="col-span-1 flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="h-2 w-32 bg-slate-50 rounded" />
            </div>
          </div>
          <div className="col-span-1">
            <div className="h-3 w-16 bg-slate-50 rounded-full" />
          </div>
          <div className="col-span-1">
            <div className="h-3 w-20 bg-slate-50 rounded" />
          </div>
          <div className="col-span-1">
            <div className="h-3 w-20 bg-slate-50 rounded" />
          </div>
          <div className="col-span-1">
            <div className="h-3 w-16 bg-slate-50 rounded-full" />
          </div>
          <div className="col-span-1 flex justify-end gap-2">
            <div className="w-8 h-8 bg-slate-50 rounded-lg" />
            <div className="w-8 h-8 bg-slate-50 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
