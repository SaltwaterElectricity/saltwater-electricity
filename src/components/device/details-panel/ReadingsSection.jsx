import { Zap, Droplets } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * ReadingsSection Component
 * High-level summary of latest telemetry metrics.
 */
export const ReadingsSection = ({ telemetry }) => {
  const voltage = telemetry?.voltage || 0;
  const tds = telemetry?.tds || 0;

  return (
    <section id="section-readings" className="scroll-mt-6">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-5">
        Real-Time Readings
      </h3>

      <div className="grid grid-cols-1 gap-3.5">
        {/* Voltage Card */}
        <ReadingCard
          icon={Zap}
          label="Voltage (V)"
          value={`${voltage}V`}
          subValue="238V Peak"
          color="text-blue-600"
          bg="bg-blue-50/50"
        />

        {/* Salinity Card */}
        <ReadingCard
          icon={Droplets}
          label="Salinity (ppm)"
          value={`${tds}ppm`}
          subValue="342ppm Avg"
          color="text-emerald-600"
          bg="bg-emerald-50/50"
        />
      </div>
    </section>
  );
};

const ReadingCard = ({ icon: Icon, label, value, subValue, color, bg }) => (
  <div
    className={cn(
      "border border-slate-100 rounded-xl p-4.5 flex justify-between items-start transition-all hover:shadow-md",
      bg
    )}
  >
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-slate-900 font-display">{value}</span>
      </div>
      <p className="text-[10px] text-slate-400 font-medium mt-1.5 italic">{subValue}</p>
    </div>
    <div className={cn("p-2.5 rounded-lg border border-white/50 shadow-sm", color, "bg-white")}>
      <Icon size={20} />
    </div>
  </div>
);
