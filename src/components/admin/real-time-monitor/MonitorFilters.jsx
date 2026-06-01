import { memo } from "react";
import GlobalSearch from "../../ui/GlobalSearch";

/**
 * COMPONENT: MonitorFilters
 * Mirrored from code1.html Filters Section.
 */
const MonitorFilters = ({
  searchTerm,
  setSearchTerm,
  locationFilter,
  setLocationFilter,
  statusFilter,
  setStatusFilter,
  locations = [],
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      {/* Local Filter Search */}
      <div className="flex-1 w-full">
        <GlobalSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search for device..."
          variant="solid"
          className="h-10" // Slightly smaller to match neighboring selectors
        />
      </div>

      {/* Location Selector */}
      <select
        value={locationFilter}
        onChange={(e) => setLocationFilter(e.target.value)}
        className="bg-white border-gray-200 rounded-xl text-sm font-semibold py-2 px-4 focus:ring-4 focus:ring-primary/5 focus:border-primary min-w-[160px] border shadow-sm outline-none transition-all"
      >
        {locations.map((loc) => (
          <option key={loc} value={loc}>
            {loc}
          </option>
        ))}
      </select>

      {/* Status Selector */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="bg-white border-gray-200 rounded-xl text-sm font-semibold py-2 px-4 focus:ring-4 focus:ring-primary/5 focus:border-primary min-w-[140px] border shadow-sm outline-none transition-all"
      >
        <option>Status</option>
        <option value="Online">Online</option>
        <option value="Offline">Offline</option>
        <option value="Warning">Warning</option>
      </select>
    </div>
  );
};

export default memo(MonitorFilters);
