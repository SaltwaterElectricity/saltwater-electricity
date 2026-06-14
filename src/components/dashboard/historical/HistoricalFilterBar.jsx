import { useState, memo } from "react";
import GlobalSearch from "../../ui/GlobalSearch";

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

  // Actual Date Logic for Data Sync
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

  const handlePresetClick = (type) => {
    if (type === "Today") onDateChange(getTodayStr());
    else if (type === "Yesterday") onDateChange(getYesterdayStr());
    else if (type === "All Time") onDateChange(null);
    setIsDateMenuOpen(false);
  };

  const handleClearFilters = () => {
    onDeviceChange("all");
    onDateChange(null);
    onSearch("");
  };

  return (
    <section className="relative z-20">
      <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4 flex-wrap hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        {/* Search Input (Dominant Width) */}
        <div className="flex-[2.5] min-w-[280px]">
          <GlobalSearch
            searchTerm={searchTerm}
            setSearchTerm={onSearch}
            placeholder="Search by household, device or location"
            variant="solid"
            className="[&>input]:bg-surface-container-low [&>input]:font-sora-body [&>input]:text-body-base [&>input]:h-14 [&>input]:rounded-xl [&>input]:border-transparent [&>input]:focus:bg-white [&>input]:focus:border-primary/20"
          />
        </div>

        {/* Device Dropdown (Standardized Width) */}
        <div className="flex-1 min-w-[220px] relative">
          <button
            onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
            className="w-full h-14 flex items-center justify-between px-5 border-2 border-outline-variant/30 rounded-xl text-body-sm font-bold text-on-surface hover:bg-surface-container-low hover:border-primary/20 transition-all active:scale-95 shadow-sm"
          >
            <div className="flex items-center gap-3 truncate mr-2">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                devices
              </span>
              <span className="truncate">{deviceLabel}</span>
            </div>
            <span className="material-symbols-outlined text-outline shrink-0">
              keyboard_arrow_down
            </span>
          </button>

          {isDeviceMenuOpen && (
            <div className="absolute top-full left-0 mt-3 w-full min-w-[240px] bg-white border border-outline-variant/30 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                <button
                  onClick={() => {
                    onDeviceChange("all");
                    setIsDeviceMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-body-sm font-bold rounded-xl transition-colors ${selectedDeviceId === "all" ? "bg-primary/10 text-primary" : "hover:bg-surface-container-low text-secondary"}`}
                >
                  All Devices
                </button>
                <div className="h-px bg-outline-variant/10 my-2" />
                {devices.map((dev) => (
                  <button
                    key={dev.device_id}
                    onClick={() => {
                      onDeviceChange(dev.device_id);
                      setIsDeviceMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-body-sm font-bold rounded-xl transition-colors ${selectedDeviceId === dev.device_id ? "bg-primary/10 text-primary" : "hover:bg-surface-container-low text-secondary"}`}
                  >
                    {dev.device_name || dev.device_id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Date Selector (Standardized Width) */}
        <div className="flex-1 min-w-[220px] relative">
          <button
            onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
            className="w-full h-14 flex items-center justify-between px-5 border-2 border-outline-variant/30 rounded-xl text-body-sm font-bold text-on-surface hover:bg-surface-container-low hover:border-primary/20 transition-all active:scale-95 shadow-sm"
          >
            <div className="flex items-center gap-3 truncate mr-2">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                calendar_today
              </span>
              <span className="truncate">{dateFilter || "Latest Records"}</span>
            </div>
            <span className="material-symbols-outlined text-outline shrink-0">
              keyboard_arrow_down
            </span>
          </button>

          {isDateMenuOpen && (
            <div className="absolute top-full right-0 mt-3 bg-white border border-outline-variant/30 rounded-2xl shadow-2xl z-50 flex overflow-hidden min-w-[320px] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 w-full space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {["Today", "Yesterday", "All Time"].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetClick(preset)}
                      className="px-4 py-2 text-body-sm font-bold rounded-xl border border-outline-variant/30 hover:bg-primary/5 hover:text-primary transition-all text-secondary"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-outline-variant/20">
                  <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-2 px-1">
                    Custom Date
                  </p>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant/30 text-body-sm font-bold focus:border-primary outline-none transition-all"
                    value={dateFilter || ""}
                    onChange={(e) => {
                      onDateChange(e.target.value);
                      setIsDateMenuOpen(false);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters (Anchored Width) */}
        <div className="flex-none">
          <button
            onClick={handleClearFilters}
            className="h-14 px-6 text-primary font-black text-body-sm hover:bg-primary/5 rounded-xl transition-all flex items-center gap-3 border-2 border-primary/20 hover:border-primary active:scale-95 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[22px]">filter_list_off</span>
            Clear Filters
          </button>
        </div>
      </div>
    </section>
  );
};

export default memo(HistoricalFilterBar);
