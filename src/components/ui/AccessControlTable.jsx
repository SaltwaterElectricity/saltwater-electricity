import { memo } from "react";
import { cn } from "../../utils/cn";

/**
 * AccessControlTable Component
 * Manages operator access and status display.
 * Maps through operator data for table rows.
 */
const AccessControlTable = memo(({ operators = [] }) => {
  return (
    <div className="glass-panel p-md">
      <div className="flex justify-between items-center mb-md">
        <div>
          <h3 className="font-h2 text-h2 text-primary font-['Space_Grotesk'] tracking-tight">System Access Control</h3>
          <p className="text-xs text-slate-500 mt-1 font-['Inter']">SuperAdmin Oversight: Managing global operators and node permissions.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center shadow-lg active:scale-95 font-['Inter'] uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm mr-2">person_add</span> Add Global Admin
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest font-['Inter']">
              <th className="pb-3 pl-2">Operator</th>
              <th className="pb-3">Global Role</th>
              <th className="pb-3">Assigned Region</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-['Inter']">
            {operators.map((operator, index) => (
              <tr key={operator.uid || index} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4 pl-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold uppercase">
                      {operator.initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{operator.name}</div>
                      <div className="text-[10px] text-slate-400">{operator.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-xs font-medium text-slate-600">{operator.role}</td>
                <td className="py-4 text-xs text-slate-500">{operator.region}</td>
                <td className="py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    operator.status === "ACTIVE" ? "bg-green-100 text-green-700" : 
                    operator.status === "OFFSITE" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
                  )}>
                    {operator.status}
                  </span>
                </td>
                <td className="py-4 text-right pr-2">
                  <button className="text-slate-400 hover:text-blue-600 transition-colors active:scale-90">
                    <span className="material-symbols-outlined text-sm">settings</span>
                  </button>
                </td>
              </tr>
            ))}
            {operators.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400 text-xs italic">
                  No operators found in the registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-50 text-center">
        <a className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest font-['Inter']" href="#">
          Manage all system users
        </a>
      </div>
    </div>
  );
});

AccessControlTable.displayName = 'AccessControlTable';

export default AccessControlTable;
