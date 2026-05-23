import { memo } from "react";
import { Plus } from "lucide-react";
import RequestAction from "./RequestAction";
import { cn } from "../../../utils/cn";

/**
 * RequestHistoryRow Component
 * Renders a single row in the device request history table.
 */
const RequestHistoryRow = memo(({ request, index, onCancelTrigger }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "approved":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "declined":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "cancelled":
        return "bg-slate-100 text-slate-400 border-slate-200 opacity-60";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <tr className="group hover:bg-surface-container-low/30 transition-colors">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              request.status === "approved"
                ? "bg-green-50 text-green-600"
                : request.status === "declined"
                  ? "bg-red-50 text-red-600"
                  : request.status === "cancelled"
                    ? "bg-slate-100 text-slate-300"
                    : "bg-primary/5 text-primary"
            )}
          >
            <Plus size={18} />
          </div>
          <div>
            <p className="font-bold text-on-surface text-sm uppercase">Request #{index + 1}</p>
            <p className="text-[11px] text-outline font-medium">
              {request.requestType.replace("_", " ")} ({request.deviceName})
            </p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="text-xs font-bold text-on-surface">
          {new Date(request.createdAt).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="text-[10px] text-outline mt-0.5">
          {new Date(request.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </td>
      <td className="px-8 py-6">
        <p className="text-xs font-bold text-on-surface">
          {request.updatedAt ? new Date(request.updatedAt).toLocaleDateString() : "—"}
        </p>
        <p className="text-[10px] text-outline mt-0.5">
          {request.updatedAt ? new Date(request.updatedAt).toLocaleTimeString() : "Not scheduled"}
        </p>
      </td>
      <td className="px-8 py-6">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border",
            getStatusStyle(request.status)
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              request.status === "pending"
                ? "bg-amber-500 animate-pulse"
                : request.status === "approved"
                  ? "bg-emerald-500"
                  : request.status === "cancelled"
                    ? "bg-slate-300"
                    : "bg-rose-500"
            )}
          />
          {request.status}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        <RequestAction request={request} onCancelTrigger={onCancelTrigger} />
      </td>
    </tr>
  );
});

RequestHistoryRow.displayName = "RequestHistoryRow";

export default RequestHistoryRow;
