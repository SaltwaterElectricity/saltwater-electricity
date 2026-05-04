import { cn } from "../../utils/cn";

/**
 * USER ROW COMPONENT
 */
export const UserRow = ({ user }) => (
  <tr className="group hover:bg-slate-50/50 transition-colors">
    <td className="py-4 pl-2">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold uppercase">
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">{user.firstName} {user.lastName}</div>
          <div className="text-[10px] text-slate-400">{user.email}</div>
        </div>
      </div>
    </td>
    <td className="py-4 text-xs font-medium text-slate-600 capitalize">{user.role}</td>
    <td className="py-4 text-xs text-slate-500">{user.address?.cityProvince || "Unset"}</td>
    <td className="py-4">
      <span className={cn(
        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
        user.status === 'active' ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"
      )}>{user.status || 'INACTIVE'}</span>
    </td>
    <td className="py-4 text-right pr-2">
      <button className="text-slate-400 hover:text-blue-600 transition-colors">
        <span className="material-symbols-outlined text-sm">settings</span>
      </button>
    </td>
  </tr>
);
