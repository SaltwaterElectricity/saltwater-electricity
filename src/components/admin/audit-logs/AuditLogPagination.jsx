import { memo } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * AuditLogPagination Component
 * Enhanced pagination with items-per-page selection.
 */
const AuditLogPagination = ({
  totalLogs,
  currentPage,
  logsPerPage,
  onPageChange,
  onLogsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalLogs / logsPerPage);
  const start = (currentPage - 1) * logsPerPage + 1;
  const end = Math.min(currentPage * logsPerPage, totalLogs);

  if (totalLogs === 0) return null;

  return (
    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
      <p className="text-xs text-gray-500 font-medium">
        Showing {start} to {end} of {totalLogs} logs
      </p>

      <div className="flex items-center gap-4">
        {/* Pagination Buttons */}
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => onPageChange(pg)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all",
                    currentPage === pg ? "bg-primary text-white" : "hover:bg-gray-50 font-medium"
                  )}
                >
                  {pg}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-2 text-gray-400 font-bold">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => onPageChange(totalPages)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium hover:bg-gray-50 transition-all",
                  currentPage === totalPages && "bg-primary text-white font-bold"
                )}
              >
                {totalPages}
              </button>
            )}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Items per page selector */}
        <div className="relative group flex items-center gap-2 border border-gray-200 px-3 py-1.5 rounded-lg">
          <select
            value={logsPerPage}
            onChange={(e) => onLogsPerPageChange(Number(e.target.value))}
            className="appearance-none bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <ChevronDown
            size={14}
            className="text-gray-400 pointer-events-none transition-transform group-focus-within:rotate-180"
          />
        </div>
      </div>
    </div>
  );
};

export default memo(AuditLogPagination);
