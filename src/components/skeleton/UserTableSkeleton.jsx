export const UserTableSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden animate-pulse">
    <div className="bg-slate-50/50 border-b border-slate-100 p-6 h-16" />
    <div className="divide-y divide-slate-50">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-3 w-16 bg-slate-50 rounded" />
            </div>
          </div>
          <div className="flex-1 hidden md:block">
            <div className="h-4 w-24 bg-slate-50 rounded mx-auto" />
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 bg-slate-50 rounded-xl" />
            <div className="w-10 h-10 bg-slate-50 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);