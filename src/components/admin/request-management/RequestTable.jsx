import { memo } from "react";
import RequestTableRow from "./RequestTableRow";

/**
 * RequestTable Component
 * Renders the main table for device requests.
 */
const RequestTable = memo(({ requests, loading, onApprove, onDecline }) => {
  return (
    <main className="bg-white/70 backdrop-blur-xl rounded-[40px] border border-white shadow-sm overflow-hidden transition-all hover:bg-white/80">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Resident Info
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Device Spec
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Timestamp
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Status
              </th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
                      Syncing Operation Data...
                    </p>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-24 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase italic tracking-widest">
                    No requests currently in queue.
                  </p>
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <RequestTableRow
                  key={req.id}
                  request={req}
                  onApprove={onApprove}
                  onDecline={onDecline}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
});

RequestTable.displayName = "RequestTable";

export default RequestTable;
