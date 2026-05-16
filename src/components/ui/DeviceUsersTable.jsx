import { memo } from "react";

/**
 * DeviceUsersTable Component
 * Displays a list of households with assigned devices.
 * Aligned with AlonKuryente Dashboard visual language.
 */
const DeviceUsersTable = memo(({ users = [], loading = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant">
          DEVICE USER&apos;S
        </h3>
        <div className="relative">
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-[11px] focus:ring-1 focus:ring-primary/20 w-48 md:w-56 transition-all"
            placeholder="Search requests..."
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar-hide">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low/50 text-[10px] text-outline uppercase font-bold tracking-wider">
            <tr>
              <th className="px-8 py-4">HOUSEHOLD&nbsp; &nbsp; USER</th>
              <th className="px-8 py-4">location</th>
              <th className="px-8 py-4">Device id</th>
              <th className="px-8 py-4">Recieve Date</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {users.map((user, index) => (
              <tr key={user.uid || index} className="hover:bg-primary/5 transition-colors group">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-8 h-8 rounded-lg object-cover border border-outline-variant/30"
                      src={
                        user.photoURL ||
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuBLKHkZHJMM1hQQ3RffYsUaDAl8RIanRUzd0_RdGvQECH9nAOeVF8T8hbL4eWQbi9kPiRdHGk2ZuIB9JGpNyj-jjU6kqTSrlOGFUeJFMq7L_Y99nzTMF7X30tjDBckDkx2VsRt0nVkVEY9CJU9B5wts1ZBj8WFkGV5NZfHZyLrp3KrqljstId4fa6VuOhtj2vPycIsF_ACqUC5O62y45VZEFvoqimbDkxCk9AvXhIQJAfHB0uLaFK5yqPjMvbLu5S0k1HS5nT0Xwq4_"
                      }
                      alt=""
                    />
                    <span className="font-bold text-xs">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-4 text-[11px] text-on-surface">
                  {user.address?.baranggay || "Purok -1 SNQ"}
                </td>
                <td className="px-8 py-4 text-[11px] text-on-surface">
                  {user.deviceId || "SD-001-SQN"}
                </td>
                <td className="px-8 py-4 text-[11px] text-outline">
                  {user.assignedAt
                    ? new Date(user.assignedAt).toLocaleDateString()
                    : "APRIL 12, 2025"}
                </td>
                <td className="px-8 py-4 text-right">
                  <button className="text-primary font-bold text-[11px] hover:underline transition-all">
                    Review
                  </button>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td
                  colSpan="5"
                  className="px-8 py-12 text-center text-[11px] font-bold text-outline animate-pulse uppercase tracking-[0.2em]"
                >
                  Synchronizing records...
                </td>
              </tr>
            )}
            {!loading && users.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-8 py-12 text-center text-[11px] font-bold text-outline uppercase tracking-[0.2em]"
                >
                  No assigned users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-outline-variant/10 flex justify-center">
        <button className="text-primary font-bold text-[11px] flex items-center gap-2 hover:underline">
          View all users
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
});

DeviceUsersTable.displayName = "DeviceUsersTable";

export default DeviceUsersTable;
