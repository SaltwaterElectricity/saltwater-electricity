import { memo } from "react";
import AuditLogTableRow from "./AuditLogTableRow";

/**
 * AuditLogTable Component
 * Advanced system audit logs table with high-fidelity styling.
 */
const AuditLogTable = ({ logs, loading }) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 transition-all hover:shadow-md">
      <div className="p-6 border-b border-gray-100 bg-white">
        <h4 className="font-bold text-primary">System Audit Logs</h4>
      </div>
      <div className="overflow-x-auto scrollbar-none overflow-y-hidden">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-black">
              <th className="px-6 py-4 text-[10px] font-bold uppercase">Username</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase">Role</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase">Action</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase">Severity</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase">IP Address</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase text-center">Date & Time</th>
              <th className="px-6 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-32 text-center">
                  <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                      Accessing Secure Logs...
                    </p>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-32 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] italic">
                    No accountability records matching your criteria.
                  </p>
                </td>
              </tr>
            ) : (
              logs.map((log) => <AuditLogTableRow key={log.id} log={log} />)
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default memo(AuditLogTable);
