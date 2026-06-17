import { memo } from "react";
import { ChevronDown } from "lucide-react";
import { GlobalSearch } from "../../ui";

/**
 * ResidentFilters Component
 * Search and dropdown filters for Resident Management.
 */
const ResidentFilters = memo(({ filters, onAddClick }) => {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    locationFilter,
    setLocationFilter,
  } = filters;

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm border border-outline-variant/30 transition-all hover:translate-y-[-2px]">
      <div className="flex flex-1 flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="flex-1 w-full">
          <GlobalSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Search user name or email"
            variant="solid"
          />
        </div>

        {/* Online/Offline Filter */}
        <div className="relative w-full lg:min-w-[180px] lg:w-auto">
          <select
            className="w-full appearance-none bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary-container/20 pr-10"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Users">All Users</option>
            <option value="Online Residents">Online Residents</option>
            <option value="Offline Residents">Offline Residents</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
            size={16}
          />
        </div>

        {/* Location Dropdown */}
        <div className="relative w-full lg:min-w-[160px] lg:w-auto">
          <select
            className="w-full appearance-none bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md outline-none focus:ring-2 focus:ring-primary-container/20 pr-10"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="Location">All Locations</option>
            {/* These could be dynamic based on user data */}
            <option value="San Andres">Pulo 1</option>
            <option value="Unisan">Pulo 2</option>
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
            size={16}
          />
        </div>
      </div>

      <button
        onClick={onAddClick}
        className="primary-gradient-btn text-white px-8 py-3 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95 whitespace-nowrap lg:w-auto w-full"
      >
        <span className="material-symbols-outlined text-[20px]">person_add</span>
        Add Resident
      </button>
    </div>
  );
});

ResidentFilters.displayName = "ResidentFilters";

export default ResidentFilters;
