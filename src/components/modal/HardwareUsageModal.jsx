/**
 * HardwareUsageModal
 * Mirrored from legacy design code1.html
 * Displays power draw and usage breakdown for IoT components.
 */
const HardwareUsageModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const components = [
    { name: "ESP32 Controller", icon: "developer_board", color: "#9333ea", power: "1 w", perc: 15 },
    { name: "Voltage Sensor", icon: "bolt", color: "#ec4899", power: "1 w", perc: 8 },
    { name: "Salinity Sensor", icon: "water_drop", color: "#0ea5e9", power: "4 w", perc: 12 },
    {
      name: "Bulb Outlet",
      icon: "lightbulb",
      color: "var(--color-primary)",
      power: "65 w",
      perc: 85,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/20 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-headline-md text-primary flex items-center gap-2">
            <span className="material-symbols-outlined">memory</span>
            Hardware Usage Breakdown
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface-container-low rounded-full transition-colors text-outline"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-lg space-y-lg">
          <div className="space-y-6">
            {components.map((comp) => (
              <div key={comp.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ color: comp.color }}
                    >
                      {comp.icon}
                    </span>
                    <span className="text-body-sm font-bold text-on-surface">{comp.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-label-xs font-bold text-primary">{comp.power}</p>
                    <p className="text-[10px] text-outline uppercase tracking-tighter">
                      Load: {comp.perc}%
                    </p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${comp.perc}%`,
                      backgroundColor: comp.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer Stats */}
          <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-label-xs text-secondary uppercase tracking-widest">
                  Aggregate Draw
                </p>
                <h4 className="text-xl font-black text-primary">48.2 Watts</h4>
              </div>
              <div className="text-right">
                <span className="px-2 py-1 bg-green-100 text-success-badge rounded-md text-[10px] font-bold">
                  OPTIMAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 bg-surface-container-low border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};

export default HardwareUsageModal;
