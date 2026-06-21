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
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant flex flex-col justify-between group hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2.5 bg-surface-container-low rounded-xl ${colorClass}`}>
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-success-badge bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
          <span className="material-symbols-outlined text-[14px]">trending_up</span>
          <span className="text-label-xs font-bold">{trend}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-label-caps text-secondary uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-extrabold text-on-surface tracking-tight">
        {value.toLocaleString()}
      </h3>
      <p className="text-label-xs text-outline font-medium mt-0.5">{unit}</p>
    </div>
    <div className="mt-4 h-10 flex items-end gap-[3px]">
      {sparkData.map((h, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={`spark-${label}-${i}`}
          className={`flex-1 ${sparklineColor} rounded-t-sm opacity-40 group-hover:opacity-100 transition-all duration-700`}
          style={{ height: `${h * 100}%`, transitionDelay: `${i * 75}ms` }}
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
const HistoricalMetricCards = ({
  devicesCount = 0,
  usersCount = 0,
  vCount = 0,
  sCount = 0,
  cCount = 0,
  isAdmin = false,
  trends = null,
}) => {
  return (
    <section
      className={`relative z-20 grid grid-cols-1 sm:grid-cols-2 ${
        isAdmin ? "lg:grid-cols-5" : "lg:grid-cols-4"
      } gap-6`}
    >
      <MetricCard
        icon="bolt"
        colorClass="text-primary"
        label="Total Voltage Readings"
        value={vCount}
        unit="Readings"
        trend="Live"
        sparklineColor="bg-primary-fixed-dim/30 group-hover:bg-primary"
        sparkData={trends?.v || [0.5, 0.75, 0.33, 1, 0.66]}
      />
      <MetricCard
        icon="water_drop"
        colorClass="text-severity-info"
        label="Total Salinity Readings"
        value={sCount}
        unit="Readings"
        sparklineColor="bg-severity-info/30 group-hover:bg-severity-info"
        sparkData={trends?.s || [0.66, 0.5, 0.75, 0.66, 1]}
      />
      <MetricCard
        icon="pause" // Pulse icon replacement from legacy
        colorClass="text-severity-medium"
        label="Total Current Readings"
        value={cCount}
        unit="Readings"
        sparklineColor="bg-severity-medium/30 group-hover:bg-severity-medium"
        sparkData={trends?.c || [0.5, 1, 0.33, 0.5, 0.66]}
      />
      {isAdmin && (
        <MetricCard
          icon="group"
          colorClass="text-success-badge"
          label="Total Household Users"
          value={usersCount || 0}
          unit="Households"
          sparklineColor="bg-success-badge/30 group-hover:bg-success-badge"
          sparkData={[0.33, 0.66, 0.5, 0.75, 1]}
        />
      )}
      <MetricCard
        icon="devices"
        colorClass="text-severity-info"
        label="Total Connected Devices"
        value={devicesCount || 0}
        unit="Devices"
        sparklineColor="bg-severity-info/30 group-hover:bg-severity-info"
        sparkData={[0.33, 0.66, 0.5, 0.75, 1]}
      />
    </section>
  );
};

export default memo(HistoricalMetricCards);
