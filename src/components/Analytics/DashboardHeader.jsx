import React, { memo } from 'react';
import PropTypes from 'prop-types';
import MetricGauge from '../UI/MetricGauge';
import { METRIC_CONFIG } from '../../constants';

/**
 * DASHBOARD HEADER
 * Orchestrates the top-level "Live" telemetry view using configuration-driven UI.
 * Performance: Memoized to prevent unnecessary re-renders during high-frequency data updates.
 */
const DashboardHeader = ({ latestReading, loading }) => {
  // 1. Guard: Ensure we have a valid data object to map against
  const data = latestReading || {};

  return (
    <header className="w-full">
      {/* Responsive Grid Strategy:
        - Mobile: Single column stack
        - Tablet: Two columns
        - Desktop: Four columns for balanced telemetry visualization
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {METRIC_CONFIG && Object.entries(METRIC_CONFIG)
          // 2. Filter: Exclude the fallback/safety entry from the UI render loop
          .filter(([key]) => key !== 'DEFAULT')
          
          // 3. Map: Transform config entries into Gauge components using spread for brevity
          .map(([key, config]) => (
            <MetricGauge
              key={key}
              {...config} // Passes label, unit, icon, and textClass automatically
              value={data[key]}
              // Senior Practice: Precise null/undefined check allows 0 to be a valid "Live" value
              pulse={!loading && data[key] !== undefined && data[key] !== null}
            />
          ))
        }
      </div>
    </header>
  );
};

DashboardHeader.propTypes = {
  latestReading: PropTypes.object,
  loading: PropTypes.bool
};

export default memo(DashboardHeader);