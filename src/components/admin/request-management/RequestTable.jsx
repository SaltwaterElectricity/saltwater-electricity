import { memo } from "react";
import { ChevronDown } from "lucide-react";
import GlobalSearch from "../../ui/GlobalSearch";
import RequestTableRow from "./RequestTableRow";

/**
 * RequestTable Component
 * Renders the main table for device requests with search and filters.
 * Synchronized with the analytical dashboard standards.
 */
const RequestTable = memo(
  ({
    requests,
    loading,
    onView,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
  }) => {
    return (
      <div className="w-full space-y-8">
        {/* Filter Section - Mirrored from code.html Section 4 */}
        <div className="bg-white p-4 rounded-[20px] shadow-[0px_1px_2px_rgba(0,0,0,0.05),0px_15px_30px_-5px_rgba(0,0,0,0.04)] border border-[#F1F5F9] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-[300px]">
            <div className="flex-1">
              <GlobalSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                placeholder="Search resident name or email"
                variant="solid"
              />
            </div>

            {/* Location Dropdown - bg-primary-container style from code.html */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 bg-[#0066ff] border border-outline-variant/30 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="all">All Locations</option>
                <option value="Purok 1">Purok 1, Island</option>
                <option value="Purok 2">Purok 2, Island</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                size={16}
              />
            </div>

            {/* Status Dropdown - bg-primary-container style from code.html */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-10 py-2.5 bg-[#0066ff] border border-outline-variant/30 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="declined">Denied</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                size={16}
              />
            </div>
          </div>
        </div>

        {/* Table Section - Mirrored from code.html Table Section */}
        <div className="bg-white rounded-[20px] shadow-[0px_1px_2px_rgba(0,0,0,0.05),0px_15px_30px_-5px_rgba(0,0,0,0.04)] border border-[#F1F5F9] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-[#f2f3ff]/30">
                  <th className="px-6 py-4 text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                    Resident Information
                  </th>
                  <th className="px-6 py-4 text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                    Type of Request
                  </th>
                  <th className="px-6 py-4 text-[11px] text-on-surface-variant uppercase font-bold tracking-wider text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[11px] text-on-surface-variant uppercase font-bold tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-[11px] text-on-surface-variant uppercase font-bold tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
                          Syncing Validation Queue...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-slate-400 italic text-sm"
                    >
                      No matching requests found in the queue.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <RequestTableRow key={req.id} request={req} onView={onView} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section - Mirrored from code.html */}
          {!loading && requests.length > 0 && (
            <div className="p-6 border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                Showing <span className="font-bold text-on-surface">1 to {requests.length}</span> of{" "}
                {requests.length} requests
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-slate-100 transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold text-sm shadow-md">
                    1
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-slate-100 transition-all text-sm">
                    2
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:bg-slate-100 transition-all">
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

RequestTable.displayName = "RequestTable";

export default RequestTable;
