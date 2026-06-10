import { useState, memo } from "react";

/**
 * HistoricalFilterBar Component
 * Mirrored from legacy design code1.html.
 * Handles device selection, date range, and search filtering.
 */
const HistoricalFilterBar = ({
  devices = [],
  selectedDeviceId,
  onDeviceChange,
  dateFilter,
  onDateChange,
  searchTerm,
  onSearch,
}) => {
  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);

  const selectedDevice = devices.find((d) => d.device_id === selectedDeviceId);
  const deviceLabel =
    selectedDeviceId === "all"
      ? "All Device Readings"
      : selectedDevice?.device_name || selectedDeviceId;

  const handleClearFilters = () => {
    onDeviceChange("all");
    onDateChange(null);
    onSearch("");
  };

  return (
    <section className="px-xl mt-lg">
      <div className="bg-white p-md rounded-xl border border-outline-variant flex items-center gap-md flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-primary-container">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg text-body-sm focus:ring-2 focus:ring-primary"
            placeholder="Search by household, device or location"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Device Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container-low transition-colors border-primary"
          >
            <span className="material-symbols-outlined text-primary-container">devices</span>
            {deviceLabel}
            <span className="material-symbols-outlined text-outline text-primary-container">
              keyboard_arrow_down
            </span>
          </button>

          {isDeviceMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-outline-variant rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={() => {
                    onDeviceChange("all");
                    setIsDeviceMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-body-sm hover:bg-surface-container-low transition-colors"
                >
                  All Devices
                </button>
                {devices.map((dev) => (
                  <button
                    key={dev.device_id}
                    onClick={() => {
                      onDeviceChange(dev.device_id);
                      setIsDeviceMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-body-sm hover:bg-surface-container-low transition-colors"
                  >
                    {dev.device_name || dev.device_id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Range Picker Placeholder */}
        <div className="relative">
          <button
            onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container-low transition-colors border-primary"
          >
            <span className="material-symbols-outlined text-primary-container">calendar_today</span>
            {dateFilter || "May 12, 2025 - May 18, 2025"}
            <span className="material-symbols-outlined text-outline text-primary-container">
              keyboard_arrow_down
            </span>
          </button>

          {isDateMenuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-outline-variant rounded-xl shadow-lg z-50 flex overflow-hidden min-w-[600px]">
              {/* Presets Sidebar */}
              <div className="w-40 bg-surface-container-low border-r border-outline-variant p-2 flex flex-col gap-1">
                {["Today", "Yesterday", "Last 7 Days", "Last 30 Days", "This Month"].map(
                  (range) => (
                    <button
                      key={range}
                      onClick={() => onDateChange(range)}
                      className={`text-left px-3 py-2 text-body-sm rounded-lg transition-colors ${dateFilter === range || (!dateFilter && range === "Last 7 Days") ? "bg-primary/10 text-primary font-bold" : "hover:bg-primary/10 hover:text-primary"}`}
                    >
                      {range}
                    </button>
                  )
                )}
                <div className="mt-auto pt-2 border-t border-outline-variant">
                  <button className="w-full text-left px-3 py-2 text-body-sm hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                    Custom Range
                  </button>
                </div>
              </div>

              {/* Calendar Mock (Mirroring Structure) */}
              <div className="flex-1 p-4">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-body-sm">May 2025</span>
                      <div className="flex gap-1">
                        <span className="material-symbols-outlined text-outline cursor-pointer text-[18px]">
                          chevron_left
                        </span>
                        <span className="material-symbols-outlined text-outline cursor-pointer text-[18px]">
                          chevron_right
                        </span>
                      </div>
                    </div>
                    {/* Simplified Grid Mock */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-outline mb-1">
                      <span>Su</span>
                      <span>Mo</span>
                      <span>Tu</span>
                      <span>We</span>
                      <span>Th</span>
                      <span>Fr</span>
                      <span>Sa</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 h-32 content-start">
                      {[...Array(31)].map((_, i) => (
                        <div
                          key={`day-${i + 1}`}
                          className={`h-6 flex items-center justify-center text-[10px] rounded cursor-pointer transition-colors ${i + 1 >= 12 && i + 1 <= 18 ? "bg-primary text-white font-bold" : "hover:bg-surface-container-low"}`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant">
                  <button
                    onClick={() => setIsDateMenuOpen(false)}
                    className="px-4 py-1.5 border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container-low transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsDateMenuOpen(false)}
                    className="px-4 py-1.5 bg-primary text-white rounded-lg text-body-sm font-bold hover:bg-primary-container transition-colors"
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters */}
        <button
          onClick={handleClearFilters}
          className="ml-auto text-primary font-bold text-body-sm px-4 py-2 hover:bg-surface-container-low rounded-lg transition-colors flex items-center gap-2 border border-primary"
        >
          <span className="material-symbols-outlined text-[20px] text-primary-container">
            filter_list_off
          </span>
          Clear Filters
        </button>
      </div>
    </section>
  );
};

export default memo(HistoricalFilterBar);
