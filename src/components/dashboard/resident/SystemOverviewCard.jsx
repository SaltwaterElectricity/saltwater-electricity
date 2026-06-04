import { memo } from "react";
import { Zap } from "lucide-react";
import { HealthDonutChart } from "../../index";

/**
 * SystemOverviewCard Component
 * Displays system health donut and key efficiency/load metrics.
 */
const SystemOverviewCard = memo(({ healthScore, totalDevices, activeDevices = totalDevices }) => (
  <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px] shadow-sm border border-outline-variant/30">
    <h5 className="text-[12px] font-bold text-on-surface tracking-tight uppercase mb-8">
      SYSTEM OVERVIEW
    </h5>

    <HealthDonutChart score={healthScore} title="Health" icon={Zap} />

    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-outline-variant/20 mt-auto">
      <div className="text-center">
        <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1 tracking-tight">
          Efficiency
        </p>
        <p className="text-body-md font-extrabold text-green-600">92%</p>
      </div>
      <div className="text-center border-x border-outline-variant/20">
        <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1 tracking-tight">
          System Load
        </p>
        <p className="text-body-md font-extrabold text-primary">24%</p>
      </div>
      <div className="text-center">
        <p className="text-[10px] text-on-surface-variant uppercase font-bold mb-1 tracking-tight">Active</p>
        <p className="text-body-md font-extrabold text-on-surface">{activeDevices}/{totalDevices}</p>
      </div>
    </div>
  </div>
));

SystemOverviewCard.displayName = "SystemOverviewCard";

export default SystemOverviewCard;
