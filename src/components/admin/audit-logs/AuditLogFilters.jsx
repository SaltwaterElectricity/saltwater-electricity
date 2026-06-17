import { memo, useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "../../../utils/cn";
import GlobalSearch from "../../ui/GlobalSearch";

/**
 * AuditLogFilters Component
 * Advanced filtering suite including search, date range, and role/activity/severity/status dropdowns.
 */
const AuditLogFilters = ({ searchTerm, setSearchTerm, filters, setFilters, onClearFilters }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateRef = useRef(null);

  // Handle click outside to close date picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <section className="space-y-6 mb-8">
      {/* Search and Date Range Row */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <GlobalSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            placeholder="Search email, action, device, or details..."
            variant="solid"
            className="w-full"
          />
        </div>

        {/* Date Range Picker Simulated */}
        <div className="relative w-full lg:w-auto" ref={dateRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold shadow-sm min-w-[240px] justify-between hover:bg-gray-50 transition-colors text-slate-700"
          >
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" />
              <span>May 15, 2025 - May 20, 2025</span>
            </div>
            <ChevronDown
              size={16}
              className={cn("text-slate-400 transition-transform", showDatePicker && "rotate-180")}
            />
          </button>

          {showDatePicker && (
            <div className="absolute top-full right-0 mt-3 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col md:flex-row overflow-hidden min-w-[320px] md:min-w-[700px] animate-in fade-in slide-in-from-top-2">
              {/* Quick Select Sidebar */}
              <div className="w-full md:w-40 border-b md:border-b-0 md:border-r border-gray-100 p-4 space-y-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Quick Select
                </p>
                <QuickSelectButton label="Today" />
                <QuickSelectButton label="Yesterday" />
                <QuickSelectButton label="Last 7 Days" />
                <QuickSelectButton label="Last 30 Days" />
                <QuickSelectButton label="This Month" />
                <QuickSelectButton label="Custom Range" active />
              </div>

              {/* Calendar View Mockup */}
              <div className="flex-1 p-6 relative bg-white">
                <div className="flex flex-col sm:flex-row gap-8 mb-4 pb-12">
                  <MonthMockup month="May 2025" />
                  <MonthMockup month="June 2025" className="hidden lg:block" />
                </div>
                <div className="absolute bottom-4 right-6 flex gap-2 pt-4">
                  <button
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg shadow-sm active:scale-95 transition-all"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Filter Dropdowns */}
      <div className="flex flex-col sm:flex-row flex-wrap lg:flex-nowrap gap-4 items-end">
        <FilterSelect
          label="User Role"
          value={filters.role}
          onChange={(v) => handleFilterChange("role", v)}
          options={["All Roles", "Super Admin", "Admin", "Resident", "System"]}
        />
        <FilterSelect
          label="Activity Type"
          value={filters.type}
          onChange={(v) => handleFilterChange("type", v)}
          options={[
            "All Types",
            "Login",
            "Logout",
            "Password Reset",
            "View Readings",
            "Device Control",
            "Assign Device",
            "Deprovision Device",
            "Edit Profile",
            "Device Request",
            "Security Alert",
            "System Event",
          ]}
        />
        <FilterSelect
          label="Severity"
          value={filters.severity}
          onChange={(v) => handleFilterChange("severity", v)}
          options={["All Severity", "Informational", "Low", "Medium", "High", "Critical"]}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(v) => handleFilterChange("status", v)}
          options={["All Status", "Success", "Warning", "Failed", "Blocked", "Pending"]}
        />

        <button
          onClick={onClearFilters}
          className="flex items-center gap-2 text-primary font-bold text-xs hover:underline mb-3 ml-4 transition-all"
        >
          <Trash2 size={14} />
          Clear Filters
        </button>
      </div>
    </section>
  );
};

const QuickSelectButton = ({ label, active }) => (
  <button
    className={cn(
      "w-full text-left text-[11px] font-bold px-2 py-2 rounded-lg transition-all",
      active ? "bg-blue-50 text-primary" : "text-slate-500 hover:bg-slate-50"
    )}
  >
    {label}
  </button>
);

const MonthMockup = ({ month, className }) => (
  <div className={cn("min-w-[200px]", className)}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">
        {month}
      </span>
    </div>
    <div className="grid grid-cols-7 gap-y-1 text-center text-[9px] font-bold">
      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
        <span key={d} className="text-slate-400 py-1">
          {d}
        </span>
      ))}
      {Array.from({ length: 31 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "py-1.5 cursor-pointer rounded-full transition-all hover:bg-blue-50 text-slate-600",
            i + 1 === 15 && "bg-primary text-white hover:bg-primary shadow-lg shadow-blue-200"
          )}
        >
          {i + 1}
        </span>
      ))}
    </div>
  </div>
);

const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="flex-1 min-w-[150px] w-full">
    <label className="text-[10px] font-black uppercase block mb-1.5 ml-1 text-primary tracking-widest">
      {label}
    </label>
    <div className="relative group">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-gray-200 py-3 pl-4 pr-10 rounded-xl text-xs font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-primary shadow-sm outline-none transition-all cursor-pointer group-hover:bg-slate-50"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform group-focus-within:rotate-180"
      />
    </div>
  </div>
);

export default memo(AuditLogFilters);
