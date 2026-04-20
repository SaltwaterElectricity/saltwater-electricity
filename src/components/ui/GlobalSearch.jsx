import { Search, X, Loader2 } from 'lucide-react';

const GlobalSearch = ({ 
  searchTerm, 
  setSearchTerm, 
  isSearching, 
  placeholder = "Search...",
  className = "" 
}) => {
  return (
    <div className={`relative w-full group ${className}`}>
      {/* 1. Search Icon / Loading Spinner */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200">
        {isSearching ? (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        ) : (
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
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
        className="w-full h-12 pl-12 pr-12 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl 
                   text-sm font-semibold text-slate-800 transition-all duration-300
                   placeholder:text-slate-400
                   focus:bg-white/40 focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm"
      />

      {/* 3. Clear Button (Lalabas lang kung may tina-type) */}
      {searchTerm && (
        <button
          onClick={() => setSearchTerm("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                     hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default GlobalSearch;