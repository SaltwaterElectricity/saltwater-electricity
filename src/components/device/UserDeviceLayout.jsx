import { ArrowRight } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { cn } from "../../utils/cn";
import { GlowLineChart } from '../ui';
import { ROUTES } from '../../constants/routes';
import { useHistory } from '../../hooks';
import { SENSOR_CONFIG, METRICS } from '../../constants';

const MetricRow = ({ label, value, unit, type, status, history }) => (
  <div className="flex justify-between items-end">
    <div>
      <p className="text-[11px] font-bold text-outline uppercase tracking-widest mb-1 font-body-md">{label}</p>
      <p className="text-xl font-h2 text-on-surface">
        {value}<span className="text-xs font-normal text-outline ml-1">{unit}</span>
      </p>
    </div>
    <GlowLineChart type={type} status={status} history={history} />
  </div>
);

export const UserDeviceLayout = ({ telemetry, deviceName, deviceId, onViewHistory }) => {
  const navigate = useNavigate();
  const { logs: history } = useHistory(deviceId, 10);

  const getStatusConfig = (tds) => {
    const config = SENSOR_CONFIG[METRICS.TDS];
    if (tds < config.warning) return { label: 'Online', color: 'text-tertiary', bg: 'bg-tertiary-fixed-dim/20', ping: 'bg-tertiary-fixed-dim' };
    if (tds < config.critical) return { label: 'Good', color: 'text-primary', bg: 'bg-primary-container/10', ping: 'bg-primary-container' };
    return { label: 'Warning', color: 'text-error', bg: 'bg-error/10', ping: 'bg-error' };
  };

  const status = getStatusConfig(telemetry?.tds || 0);

  const handleAnalyticsRedirect = () => {
    if (onViewHistory) {
      onViewHistory();
    } else {
      const targetPath = ROUTES.DEVICE_ANALYTICS.replace(':deviceId', deviceId);
      navigate(targetPath);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-h2 text-xl font-bold text-on-surface tracking-tight leading-tight">
            {deviceName || "Aqua Unit"}
          </h3>
          <p className="text-xs font-mono text-outline">ID: {deviceId}</p>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          status.bg, status.color
        )}>
          {status.label}
        </div>
      </div>

      <div className="space-y-8 py-4">
        <MetricRow 
          label="Voltage" 
          value={telemetry?.voltage || '--'} 
          unit="V" 
          type="voltage" 
          status={status.label === 'Warning' ? 'Warning' : 'Online'} 
          history={history}
        />
        <MetricRow 
          label="Salinity" 
          value={telemetry?.tds || '--'} 
          unit="PSU" 
          type="salinity" 
          status={status.label === 'Warning' ? 'Warning' : 'Online'} 
          history={history}
        />
      </div>

      <button 
        onClick={handleAnalyticsRedirect}
        className="group w-full py-4 ocean-gradient text-white font-bold text-sm tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-2xl"
      >
        View Analytics
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
