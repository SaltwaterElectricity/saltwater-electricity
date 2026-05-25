import { memo } from "react";
import GlobalSearch from "../../ui/GlobalSearch";
import RequestTableRow from "./RequestTableRow";

/**
 * RequestTable Component
 * Renders the main table for device requests with search and filters.
 */
const RequestTable = memo(({ 
  requests, 
  loading, 
  onView,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  locationFilter,
  setLocationFilter
}) => {
  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.05),_0_15_30px_-5px_rgba(0,0,0,0.04)] border border-[#F1F5F9] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-[300px]">
          <div className="flex-1 max-w-md">
            <GlobalSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Search resident name or email"
              variant="solid"
            />
          </div>
          
          <div className="relative">
            <select 
              className="appearance-none pl-4 pr-10 py-2.5 border-slate-200 rounded-xl text-sm focus:ring-blue-600 focus:border-blue-600 transition-all cursor-pointer bg-blue-600 text-white font-medium outline-none"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="Purok 1">Purok 1, Alibijaban Island San Andes, Quezon</option>
              <option value="Purok 2">Purok 2, Alibijaban Island San Andes, Quezon</option>
            </select>
          </div>

          <div className="relative">
            <select 
              className="appearance-none pl-4 pr-10 py-2.5 border-slate-200 rounded-xl text-sm focus:ring-blue-600 focus:border-blue-600 transition-all cursor-pointer bg-blue-600 text-white font-medium outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="declined">Denied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,0.05),_0_15_30px_-5px_rgba(0,0,0,0.04)] border border-[#F1F5F9] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-[#F8FAFC]/50">
                <th className="px-6 py-4 text-[11px] text-slate-500 uppercase font-bold tracking-widest">Resident Information</th>
                <th className="px-6 py-4 text-[11px] text-slate-500 uppercase font-bold tracking-widest">Type of Request</th>
                <th className="px-6 py-4 text-[11px] text-slate-500 uppercase font-bold tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] text-slate-500 uppercase font-bold tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[11px] text-slate-500 uppercase font-bold tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Validation Data...</p>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    No matching requests found in the queue.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <RequestTableRow
                    key={req.id}
                    request={req}
                    onView={onView}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

RequestTable.displayName = "RequestTable";

export default RequestTable;
