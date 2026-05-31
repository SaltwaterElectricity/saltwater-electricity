import { memo } from "react";
import { Search } from "lucide-react";

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
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 pr-4 py-2 w-full bg-white border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary border shadow-sm transition-all"
          placeholder="Search for device..."
          type="text"
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
