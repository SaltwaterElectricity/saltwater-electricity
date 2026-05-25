import { memo } from "react";
import { cn } from "../../../utils/cn";

/**
 * RequestTableRow Component
 * Individual row for the Request Validation table.
 */
const RequestTableRow = memo(({ request, onView }) => {
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "declined":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getAvatarGradient = (name) => {
    const hash = name ? name.length : 0;
    const gradients = [
      "from-blue-400 to-indigo-600",
      "from-orange-400 to-red-500",
      "from-emerald-400 to-teal-600",
      "from-pink-400 to-rose-600",
      "from-purple-400 to-violet-600",
    ];
    return gradients[hash % gradients.length];
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0 bg-gradient-to-br",
              getAvatarGradient(request.residentName)
            )}
          >
            {getInitials(request.residentName)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{request.residentName}</p>
            <p className="text-[11px] text-slate-500 truncate">
              {request.residentEmail || "No Email Provided"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-slate-700 font-medium">
          {request.requestType
            ?.split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ") || "General Request"}
        </p>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
          Device: {request.deviceName}
        </p>
      </td>
      <td className="px-6 py-4">
        <span
          className={cn(
            "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider",
            getStatusStyle(request.status)
          )}
        >
          {request.status === "declined" ? "Denied" : request.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-700">
          <p className="font-medium">{formatDate(request.createdAt)}</p>
          <p className="text-[11px] text-slate-400">{formatTime(request.createdAt)}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onView(request)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all text-xs font-bold active:scale-95 shadow-sm"
        >
          View
        </button>
      </td>
    </tr>
  );
});

RequestTableRow.displayName = "RequestTableRow";

export default RequestTableRow;
