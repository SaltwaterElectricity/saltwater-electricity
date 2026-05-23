import { memo } from "react";
import { Clock, XCircle } from "lucide-react";
import RequestHistoryRow from "./RequestHistoryRow";

/**
 * RequestHistoryTable Component
 * Displays the history of device requests in a table.
 */
const RequestHistoryTable = memo(({ requests, loading, onCancelTrigger }) => {
  return (
    <section className="bg-cardBg border border-outline-variant/30 rounded-3xl overflow-hidden shadow-premium">
      <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
        <h3 className="font-h2 text-xl uppercase tracking-tight">Request History</h3>
        <div className="flex items-center gap-4 text-outline">
          <Clock size={18} />
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline">
                Request Number
              </th>
              <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline">
                Date Requested
              </th>
              <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline">
                Date Device Release
              </th>
              <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline">
                Status
              </th>
              <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-outline text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-50">
                    <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
                      Synchronizing Archive...
                    </p>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                    <XCircle size={40} className="text-outline" />
                    <p className="text-sm font-bold text-outline uppercase tracking-widest italic">
                      No hardware records found.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req, index) => (
                <RequestHistoryRow
                  key={req.id}
                  request={req}
                  index={index}
                  onCancelTrigger={onCancelTrigger}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-6 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs text-on-surface-variant font-medium">Show</span>
          <div className="relative">
            <select className="appearance-none bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2 pr-8 text-xs font-bold text-on-surface focus:ring-2 focus:ring-primary/20 outline-none">
              <option>10 per page</option>
              <option>20 per page</option>
              <option>50 per page</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-lg font-bold shadow-md shadow-primary/20">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-xs">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center border border-outline-variant/30 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-xs">
            3
          </button>
        </div>
      </div>
    </section>
  );
});

RequestHistoryTable.displayName = "RequestHistoryTable";

export default RequestHistoryTable;
