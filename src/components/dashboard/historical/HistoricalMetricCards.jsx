import { memo } from "react";

/**
 * MetricCard Component
 * Internal helper for HistoricalMetricCards.
 */
const MetricCard = ({
  icon,
  colorClass,
  label,
  value,
  unit,
  trend,
  sparklineColor,
  sparkData = [0.5, 0.75, 0.33, 1, 0.66],
}) => (
  <div className="bg-white p-lg rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between group hover:border-primary transition-all">
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 bg-surface-container-low rounded-lg ${colorClass}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-success-badge bg-green-50 px-2 py-0.5 rounded-full">
          <span className="material-symbols-outlined text-[14px]">trending_up</span>
          <span className="text-label-xs">{trend}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-label-xs text-secondary uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-headline-md font-extrabold">{value.toLocaleString()}</h3>
      <p className="text-label-xs text-outline">{unit}</p>
    </div>
    <div className="mt-4 h-12 flex items-end gap-[2px]">
      {sparkData.map((h, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={`spark-${label}-${i}`}
          className={`flex-1 ${sparklineColor} h-0 group-hover:opacity-100 transition-all duration-500`}
          style={{ height: `${h * 100}%`, transitionDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  </div>
);

/**
 * HistoricalMetricCards Component
 * Mirrored from legacy design code1.html.
 * Displays a grid of 5 metric cards with animated sparklines.
 */
const HistoricalMetricCards = ({ devicesCount = 0, usersCount = 0, logsCount = 0 }) => {
  return (
    <section className="px-xl -mt-8 relative z-20 grid grid-cols-1 md:grid-cols-5 gap-md">
      <MetricCard
        icon="bolt"
        colorClass="text-primary"
        label="Total Voltage Readings"
        value={Math.round(logsCount * 0.46) || 240580}
        unit="Readings"
        trend="12.5%"
        sparklineColor="bg-primary-fixed-dim/30 group-hover:bg-primary"
        sparkData={[0.5, 0.75, 0.33, 1, 0.66]}
      />
      <MetricCard
        icon="water_drop"
        colorClass="text-severity-info"
        label="Total Salinity Readings"
        value={Math.round(logsCount * 0.35) || 185430}
        unit="Readings"
        sparklineColor="bg-severity-info/30 group-hover:bg-severity-info"
        sparkData={[0.66, 0.5, 0.75, 0.66, 1]}
      />
      <MetricCard
        icon="pause" // Pulse icon replacement from legacy
        colorClass="text-severity-medium"
        label="Total Current Readings"
        value={Math.round(logsCount * 0.18) || 95210}
        unit="Readings"
        sparklineColor="bg-severity-medium/30 group-hover:bg-severity-medium"
        sparkData={[0.5, 1, 0.33, 0.5, 0.66]}
      />
      <MetricCard
        icon="group"
        colorClass="text-success-badge"
        label="Total Household Users"
        value={usersCount || 84}
        unit="Households"
        sparklineColor="bg-success-badge/30 group-hover:bg-success-badge"
        sparkData={[0.33, 0.66, 0.5, 0.75, 1]}
      />
      <MetricCard
        icon="devices"
        colorClass="text-severity-info"
        label="Total Connected Devices"
        value={devicesCount || 128}
        unit="Devices"
        sparklineColor="bg-severity-info/30 group-hover:bg-severity-info"
        sparkData={[0.33, 0.66, 0.5, 0.75, 1]}
      />
    </section>
  );
};

export default memo(HistoricalMetricCards);
