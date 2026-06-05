import { Search, X, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const GlobalSearch = ({
  searchTerm,
  setSearchTerm,
  isSearching,
  placeholder = "Search...",
  className = "",
  variant = "glass", // "glass" | "solid" | "minimal"
}) => {
  const isMinimal = variant === "minimal";

  return (
    <div className={cn("relative w-full group", className)}>
      {/* 1. Search Icon / Loading Spinner */}
      <div
        className={cn(
          "absolute top-1/2 -translate-y-1/2 transition-colors duration-200 z-10",
          isMinimal ? "left-3" : "left-4"
        )}
      >
        {isSearching ? (
          <Loader2 className={cn("text-blue-500 animate-spin", isMinimal ? "w-3.5 h-3.5" : "w-5 h-5")} />
        ) : (
          <Search
            className={cn(
              "transition-colors",
              isMinimal ? "w-3.5 h-3.5" : "w-5 h-5",
              variant === "glass"
                ? "text-gray-400 group-focus-within:text-blue-500"
                : variant === "minimal"
                ? "text-slate-400 group-focus-within:text-blue-500"
                : "text-outline group-focus-within:text-primary"
            )}
          />
        )}
      </div>

      {/* 2. Main Input Field */}
      <input
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        autoCapitalize="none"
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full transition-all duration-300 outline-none",
          variant === "glass" &&
            "h-12 pl-12 pr-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white/40 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 shadow-sm font-body-md",
          variant === "solid" &&
            "h-12 pl-12 pr-12 bg-surface border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container font-body-md",
          variant === "minimal" &&
            "h-9 pl-9 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
        )}
      />

      {/* 3. Clear Button */}
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all z-10",
            isMinimal ? "right-2 p-1" : "right-3 p-1.5"
          )}
          title="Clear search"
        >
          <X className={isMinimal ? "w-3 h-3" : "w-4 h-4"} />
        </button>
      )}
    </div>
  );
};

export default GlobalSearch;
