export const ProfileFormSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-slate-100 rounded-lg w-10 h-10" />
        <div className="space-y-2">
          <div className="h-3 w-32 bg-slate-100 rounded" />
          <div className="h-2 w-48 bg-slate-50 rounded" />
        </div>
      </div>
      <div className="h-8 w-24 bg-slate-50 rounded-lg" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-2">
          <div className="h-2 w-20 bg-slate-100 rounded" />
          <div className="h-10 w-full bg-slate-50 rounded-xl" />
        </div>
      ))}
    </div>

    <div className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <div className="h-3 w-4 bg-slate-100 rounded" />
        <div className="h-3 w-32 bg-slate-100 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-2">
            <div className="h-2 w-20 bg-slate-100 rounded" />
            <div className="h-10 w-full bg-slate-50 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);