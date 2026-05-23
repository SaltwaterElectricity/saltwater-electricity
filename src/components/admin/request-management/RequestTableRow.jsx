import { memo } from "react";
import { User, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * RequestTableRow Component
 * Individual row for the Request table.
 */
const RequestTableRow = memo(({ request, onApprove, onDecline }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "declined":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <tr className="group hover:bg-white transition-all duration-300">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <User size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 leading-none mb-1">
              {request.residentName}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              UID: {request.userId.substring(0, 10)}...
            </p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="text-xs font-black text-slate-700 leading-none mb-1">{request.deviceName}</p>
        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">
          {request.requestType?.replace("_", " ")}
        </p>
      </td>
      <td className="px-8 py-6">
        <p className="text-[11px] font-bold text-slate-600">
          {new Date(request.createdAt).toLocaleDateString()}
        </p>
        <p className="text-[9px] font-bold text-slate-400 uppercase">
          {new Date(request.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </td>
      <td className="px-8 py-6">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all",
            getStatusStyle(request.status)
          )}
        >
          {request.status === "pending" && <Clock size={10} />}
          {request.status === "approved" && <CheckCircle2 size={10} />}
          {request.status === "declined" && <XCircle size={10} />}
          {request.status}
        </span>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center justify-end gap-2">
          {request.status === "pending" ? (
            <>
              <button
                onClick={() => onApprove(request)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-900/10"
              >
                Approve
              </button>
              <button
                onClick={() => onDecline(request)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-rose-900/10"
              >
                Decline
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest">Resolved</span>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});

RequestTableRow.displayName = "RequestTableRow";

export default RequestTableRow;
