import { memo, useState } from "react";

/**
 * HistoricalTable Component
 * Mirrored from legacy design code1.html.
 * Displays a paginated table of historical data with user avatars and status badges.
 */
const HistoricalTable = ({ logs = [], residentsMap = {}, loading = false, onRefresh }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const currentLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (voltage, tds) => {
    if (voltage < 220 || tds > 500) {
      return (
        <span className="px-1.5 py-0.5 bg-red-100 text-error-badge rounded-full text-[9px] font-bold inline-flex items-center gap-1 uppercase">
          <span className="w-1 h-1 bg-error-badge rounded-full" /> Critical
        </span>
      );
    }
    if (voltage < 230 || tds > 400) {
      return (
        <span className="px-1.5 py-0.5 bg-orange-100 text-warning-badge rounded-full text-[9px] font-bold inline-flex items-center gap-1 uppercase">
          <span className="w-1 h-1 bg-warning-badge rounded-full" /> Warning
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 bg-green-100 text-success-badge rounded-full text-[9px] font-bold inline-flex items-center gap-1 uppercase">
        <span className="w-1 h-1 bg-success-badge rounded-full" /> Normal
      </span>
    );
  };

  return (
    <section className="py-6">
      <div className="bg-white rounded-2xl border border-outline-variant shadow-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
        <div className="p-6 flex justify-between items-center bg-surface-container-lowest border-b border-outline-variant/30">
          <div>
            <h4 className="text-xl font-extrabold text-on-surface tracking-tight leading-none uppercase">
              <span className="text-on-surface">Detailed</span>{" "}
              <span className="text-primary">Data Records</span>
            </h4>
            <p className="text-[10px] text-secondary mt-1.5 font-bold uppercase tracking-wider">
              System Telemetry History
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onRefresh?.()}
              className="flex items-center gap-2.5 px-4 py-2 border border-primary/20 rounded-xl text-[10px] font-black text-primary hover:bg-primary/5 hover:border-primary transition-all active:scale-95 shadow-sm uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Refresh Records
            </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="p-4 text-[9px] text-secondary whitespace-nowrap uppercase tracking-widest font-black">
                  DATE & TIME
                </th>
                <th className="p-4 text-[9px] text-secondary whitespace-nowrap uppercase tracking-widest font-black">
                  HOUSEHOLD USER
                </th>
                <th className="p-4 text-[9px] text-secondary whitespace-nowrap uppercase tracking-widest font-black text-center">
                  DEVICE
                </th>
                <th className="p-4 text-[9px] text-secondary whitespace-nowrap uppercase tracking-widest font-black">
                  LOCATION
                </th>
                <th className="p-4 text-[9px] text-secondary whitespace-nowrap text-center uppercase tracking-widest font-black">
                  VOLTAGE
                </th>
                <th className="p-4 text-[9px] text-secondary whitespace-nowrap text-center uppercase tracking-widest font-black">
                  SALINITY
                </th>
                <th className="p-4 text-[9px] text-secondary whitespace-nowrap text-center uppercase tracking-widest font-black">
                  CURRENT
                </th>
                <th className="p-4 text-[9px] text-secondary whitespace-nowrap text-center uppercase tracking-widest font-black">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-16 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        Syncing Records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : currentLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-16 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <span className="material-symbols-outlined text-3xl">inventory_2</span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-outline">
                        No Records Found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => {
                  const user = residentsMap[log.userId] || {};
                  const date = new Date(log.__normalizedTs);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-primary/[0.02] transition-colors group border-b border-outline-variant/10 last:border-0"
                    >
                      <td className="p-4">
                        <p className="text-[11px] font-black text-on-surface uppercase tracking-tight">
                          {date.toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[9px] text-outline font-bold mt-0.5 uppercase tracking-tighter">
                          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            className="w-8 h-8 rounded-full border border-outline-variant/30 bg-surface-container flex items-center justify-center overflow-hidden shadow-sm group-hover:border-primary/30 transition-colors"
                            src={
                              user.photoURL ||
                              `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=eff6ff&color=2563eb&bold=true`
                            }
                            alt={user.firstName}
                          />
                          <div>
                            <p className="text-[11px] font-black text-on-surface uppercase tracking-tight">
                              {user.firstName ? `${user.firstName} ${user.lastName}` : "System Node"}
                            </p>
                            <p className="text-[9px] text-outline font-bold truncate max-w-[120px]">
                              {user.email || "LOGS@INFRA"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2 py-0.5 bg-surface-container-high rounded text-[9px] font-black text-on-surface-variant uppercase tracking-widest border border-outline-variant/20">
                          {log.deviceId}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-[10px] font-bold text-secondary uppercase tracking-tight">
                          {user.address?.baranggay || "HQ Control"}
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-[11px] font-black text-on-surface">
                          {log.voltage}<span className="text-[8px] text-outline ml-0.5 font-bold uppercase">v</span>
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-[11px] font-black text-on-surface">
                          {log.tds}<span className="text-[8px] text-outline ml-0.5 font-bold uppercase">ppm</span>
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        <p className="text-[11px] font-black text-on-surface">
                          {log.current}<span className="text-[8px] text-outline ml-0.5 font-bold uppercase">a</span>
                        </p>
                      </td>
                      <td className="p-4 text-center">
                        {getStatusBadge(log.voltage, log.tds)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-between items-center">
          <p className="text-[10px] text-secondary font-black uppercase tracking-widest">
            Showing <span className="text-on-surface">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="text-on-surface">{Math.min(currentPage * itemsPerPage, logs.length)}</span> of{" "}
            <span className="text-on-surface">{logs.length}</span> records
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-secondary font-black uppercase tracking-tight">Rows</span>
              <select className="bg-surface-container-low border border-outline-variant/30 rounded-lg text-[10px] px-3 py-1 font-black focus:ring-1 focus:ring-primary cursor-pointer shadow-sm outline-none">
                <option>5</option>
                <option>10</option>
                <option>25</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-outline hover:text-primary hover:bg-primary/5 rounded-lg transition-all disabled:opacity-20 active:scale-95 border border-transparent hover:border-primary/20"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-black text-[10px] transition-all shadow-sm ${currentPage === pageNum ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "hover:bg-surface-container-low text-secondary"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && <span className="px-2 text-outline font-black text-[10px]">...</span>}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 text-outline hover:text-primary hover:bg-primary/5 rounded-lg transition-all active:scale-95 border border-transparent hover:border-primary/20"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(HistoricalTable);
