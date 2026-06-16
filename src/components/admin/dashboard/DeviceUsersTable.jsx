import { memo } from "react";

/**
 * DeviceUsersTable Component
 * Displays a list of households with assigned devices.
 * Aligned with AlonKuryente Dashboard visual language.
 */
const DeviceUsersTable = memo(({ users = [], loading = false, searchTerm = "", setSearchTerm }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col border border-outline-variant/10 transition-all hover:shadow-md h-full">
      <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-white">
        <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant">
          DEVICE USER&apos;S
        </h3>
        <div className="relative">
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-[11px] font-bold text-on-surface focus:ring-2 focus:ring-primary/20 w-48 md:w-56 transition-all outline-none"
            placeholder="Search users..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar-hide flex-1">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50 text-[10px] text-outline uppercase font-black tracking-widest sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              <th className="px-8 py-4">HOUSEHOLD&nbsp; &nbsp; USER</th>
              <th className="px-8 py-4">location</th>
              <th className="px-8 py-4">Device id</th>
              <th className="px-8 py-4">Receive Date</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {users.map((user) => (
              <tr
                key={user.uid || user.id}
                className="hover:bg-primary/5 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
              >
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-9 h-9 rounded-lg object-cover border border-outline-variant/20 shadow-sm"
                      src={
                        user.photoURL ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=eff6ff&color=2563eb&bold=true`
                      }
                      alt=""
                    />
                    <div className="flex flex-col">
                      <span className="font-black text-xs text-on-surface leading-none">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[9px] text-outline mt-1 uppercase font-bold tracking-tighter">
                        {user.role || "Resident"}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[11px] font-bold text-on-surface bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant/10">
                    {user.address?.baranggay || "Unassigned"}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[11px] font-black text-primary uppercase tracking-tighter">
                    {user.deviceId || "No Device"}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[11px] font-bold text-outline">
                    {user.assignedAt
                      ? new Date(user.assignedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "Not available"}
                  </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <button className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline transition-all active:scale-95 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-30 animate-pulse">
                    <span className="material-symbols-outlined text-4xl text-primary animate-spin">
                      sync
                    </span>
                    <p className="text-[10px] font-black text-outline uppercase tracking-[0.3em]">
                      Synchronizing Technical records...
                    </p>
                  </div>
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <span className="material-symbols-outlined text-4xl">person_off</span>
                    <p className="text-[10px] font-black text-outline uppercase tracking-[0.3em]">
                      No active assignments found
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-outline-variant/10 flex justify-center bg-gray-50/30">
        <button className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline transition-all">
          View all users
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
});

DeviceUsersTable.displayName = "DeviceUsersTable";

export default DeviceUsersTable;
