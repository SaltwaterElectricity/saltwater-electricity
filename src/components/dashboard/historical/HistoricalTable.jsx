import { memo, useState } from "react";

/**
 * HistoricalTable Component
 * Mirrored from legacy design code1.html.
 * Displays a paginated table of historical data with user avatars and status badges.
 */
const HistoricalTable = ({ logs = [], residentsMap = {}, loading = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const currentLogs = logs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (voltage, tds) => {
    if (voltage < 220 || tds > 500) {
      return (
        <span className="px-2 py-1 bg-red-100 text-error-badge rounded-full text-label-xs font-bold inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-error-badge rounded-full" /> Critical
        </span>
      );
    }
    if (voltage < 230 || tds > 400) {
      return (
        <span className="px-2 py-1 bg-orange-100 text-warning-badge rounded-full text-label-xs font-bold inline-flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-warning-badge rounded-full" /> Warning
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-green-100 text-success-badge rounded-full text-label-xs font-bold inline-flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-success-badge rounded-full" /> Normal
      </span>
    );
  };

  return (
    <section className="px-xl py-lg">
      <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-lg flex justify-between items-center bg-surface-container-lowest">
          <div>
            <h4 className="font-headline-md text-headline-md">
              <span className="text-on-surface">Historical</span>{" "}
              <span className="text-primary">Data Records</span>
            </h4>
            <p className="text-body-sm text-secondary">
              Detailed historical electricity generation records from all monitored devices.
            </p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-3 py-1.5 border border-primary rounded-lg text-label-xs font-bold hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-primary-fixed-dim">
                refresh
              </span>
              Refresh Page
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-y border-outline-variant">
              <tr>
                <th className="p-md text-label-caps text-secondary whitespace-nowrap">
                  DATE & TIME
                </th>
                <th className="p-md text-label-caps text-secondary whitespace-nowrap">
                  HOUSEHOLD USER
                </th>
                <th className="p-md text-label-caps text-secondary whitespace-nowrap">
                  DEVICE NAME
                </th>
                <th className="p-md text-label-caps text-secondary whitespace-nowrap">LOCATION</th>
                <th className="p-md text-label-caps text-secondary whitespace-nowrap text-center">
                  VOLTAGE
                </th>
                <th className="p-md text-label-caps text-secondary whitespace-nowrap text-center">
                  SALINITY
                </th>
                <th className="p-md text-label-caps text-secondary whitespace-nowrap text-center">
                  CURRENT
                </th>
                <th className="p-md text-label-caps text-secondary whitespace-nowrap text-center">
                  STATUS
                </th>
                <th className="p-md text-label-caps text-secondary whitespace-nowrap text-right">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-xl text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-body-sm text-outline">Fetching records...</p>
                    </div>
                  </td>
                </tr>
              ) : currentLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-xl text-center text-outline text-body-sm">
                    No historical records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => {
                  const user = residentsMap[log.userId] || {};
                  const date = new Date(log.__normalizedTs);

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-surface-container-low transition-colors group"
                    >
                      <td className="p-md">
                        <p className="text-body-sm font-bold">
                          {date.toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-label-xs text-outline">
                          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </td>
                      <td className="p-md">
                        <div className="flex items-center gap-3">
                          <img
                            className="w-8 h-8 rounded-full border border-outline-variant bg-surface-container"
                            src={
                              user.photoURL ||
                              `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`
                            }
                            alt={user.firstName}
                          />
                          <div>
                            <p className="text-body-sm font-bold">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-label-xs text-outline">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-md">
                        <span className="px-2 py-1 bg-surface-container-high rounded text-label-xs font-bold">
                          {log.deviceId}
                        </span>
                      </td>
                      <td className="p-md text-body-sm">
                        {user.address?.baranggay || "Unassigned"}
                      </td>
                      <td className="p-md text-body-sm text-center font-bold">{log.voltage} V</td>
                      <td className="p-md text-body-sm text-center">{log.tds} ppm</td>
                      <td className="p-md text-body-sm text-center">{log.current} A</td>
                      <td className="p-md text-center">{getStatusBadge(log.voltage, log.tds)}</td>
                      <td className="p-md text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 hover:bg-surface-container-high rounded-lg text-outline">
                            <span className="material-symbols-outlined text-[18px]">
                              visibility
                            </span>
                          </button>
                          <button className="p-1.5 hover:bg-surface-container-high rounded-lg text-outline">
                            <span className="material-symbols-outlined text-[18px]">analytics</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-md bg-surface-container-lowest border-t border-outline-variant flex justify-between items-center">
          <p className="text-body-sm text-secondary">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, logs.length)} of {logs.length} records
          </p>
          <div className="flex items-center gap-md">
            <div className="flex items-center gap-2">
              <span className="text-body-sm text-secondary">Show</span>
              <select className="bg-surface-container-low border-none rounded-lg text-body-sm px-3 py-1 focus:ring-primary cursor-pointer">
                <option>5 per page</option>
                <option>10 per page</option>
                <option>20 per page</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 text-outline hover:text-primary transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold text-body-sm transition-colors ${currentPage === pageNum ? "bg-primary text-on-primary" : "hover:bg-surface-container-low"}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && <span className="px-2 text-outline">...</span>}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 text-outline hover:text-primary transition-colors disabled:opacity-30"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(HistoricalTable);
