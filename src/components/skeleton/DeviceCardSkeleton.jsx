export const DeviceCardSkeleton = () => (
  <div className="border border-white/10 rounded-[24px] p-6 bg-white/10 backdrop-blur-sm shadow-xl flex flex-col justify-between h-[380px] animate-pulse">
    <div>
      {/* HEADER: Subtle Pill & ID */}
      <div className="flex justify-between items-start mb-6">
        <div className="h-5 w-20 bg-white/20 rounded-full" />
        <div className="h-3 w-16 bg-white/10 rounded" />
      </div>

      {/* IDENTITY: Icon & Title Blocks */}
      <div className="flex items-center gap-4 mb-6">
        {/* Subtle Inner Shadow effect using white/20 */}
        <div className="w-12 h-12 rounded-2xl bg-white/20 shadow-inner" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-3/4 bg-white/20 rounded-lg" />
          <div className="h-3 w-1/2 bg-white/10 rounded" />
        </div>
      </div>

      {/* DATA SECTION: Row Separators */}
      <div className="space-y-5 border-y border-white/10 py-6">
        <div className="h-4 w-full bg-white/10 rounded" />
        <div className="h-4 w-5/6 bg-white/10 rounded" />
        <div className="h-4 w-4/6 bg-white/5 rounded" />
      </div>
    </div>

    {/* FOOTER ACTION: Large Button Placeholder */}
    <div className="h-14 w-full bg-white/20 rounded-2xl" />
  </div>
);