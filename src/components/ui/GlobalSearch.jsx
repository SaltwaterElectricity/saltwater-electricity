import { Search, X, Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

const GlobalSearch = ({
  searchTerm,
  setSearchTerm,
  isSearching,
  placeholder = "Search...",
  className = "",
  variant = "glass", // "glass" | "solid"
}) => {
  return (
    <div className={cn("relative w-full group", className)}>
      {/* 1. Search Icon / Loading Spinner */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 z-10">
        {isSearching ? (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        ) : (
          <Search
            className={cn(
              "w-5 h-5 transition-colors",
              variant === "glass"
                ? "text-gray-400 group-focus-within:text-blue-500"
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
          "w-full h-12 pl-12 pr-12 transition-all duration-300 outline-none font-body-md",
          variant === "glass"
            ? "bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white/40 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
            : "bg-surface border border-outline-variant/30 rounded-xl text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container"
        )}
      />

      {/* 3. Clear Button (Lalabas lang kung may tina-type) */}
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                     hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all z-10"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default GlobalSearch;
