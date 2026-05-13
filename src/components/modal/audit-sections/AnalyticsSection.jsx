import { DeviceAnalyticsChart } from "../../";
import { METRIC_CONFIG, METRICS } from "../../../constants";
import { MiniStat, SectionHeader } from "../../ui";

export const AnalyticsSection = ({ logs }) => {
  const salinityData = logs.map((l) => ({ timestamp: l.__normalizedTs, value: l.tds_ppm || 0 }));

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      <SectionHeader title="Performance Analytics" sub="Time-series monitoring for key metrics" />
      <div className="h-48 md:h-64 bg-slate-50/50 rounded-3xl border border-slate-100 p-6">
        <DeviceAnalyticsChart data={salinityData} metricConfig={METRIC_CONFIG[METRICS.TDS]} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MiniStat label="Current TDS" value={salinityData[0]?.value || "0"} unit="ppm" />
        <MiniStat
          label="Peak Value"
          value={Math.max(...salinityData.map((d) => d.value), 0).toFixed(0)}
          unit="ppm"
        />
        <MiniStat label="Data Points" value={salinityData.length} unit="pts" />
      </div>
    </div>
  );
};
