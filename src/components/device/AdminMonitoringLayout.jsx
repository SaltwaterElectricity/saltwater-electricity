import { Activity, User, Wifi, ExternalLink, MoreVertical } from "lucide-react";
import { cn } from "../../utils/cn";
import { GlowLineChart } from "../ui";
import { useHistory } from "../../hooks";
import { SENSOR_CONFIG, METRICS } from "../../constants";

const InfoTag = ({ label, value, icon: Icon, align = "left" }) => (
  <div
    className={cn("flex items-center gap-2", align === "right" && "flex-row-reverse text-right")}
  >
    <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline">
      <Icon size={14} />
    </div>
    <div>
      <p className="text-[11px] font-bold text-outline uppercase tracking-widest leading-none mb-1 font-body-md">
        {label}
      </p>
      <p className="text-[13px] font-bold text-on-surface leading-none font-body-md">{value}</p>
    </div>
  </div>
);

const MetricRow = ({ label, value, unit, type, status, history }) => (
  <div className="flex justify-between items-end">
    <div>
      <p className="text-[11px] font-bold text-outline uppercase tracking-widest mb-1 font-body-md">
        {label}
      </p>
      <p
        className={cn(
          "text-xl font-h2 text-on-surface",
          status === "Warning" && type === "voltage" && "text-error"
        )}
      >
        {value}
        <span className="text-xs font-normal text-outline ml-1">{unit}</span>
      </p>
    </div>
    <GlowLineChart type={type} status={status} history={history} />
  </div>
);

export const AdminMonitoringLayout = ({ device, telemetry, onViewAnalytics }) => {
  const voltageThreshold = SENSOR_CONFIG[METRICS.VOLTAGE]?.warning || 3.2;
  const status = device.status || (telemetry?.voltage < voltageThreshold ? "Warning" : "Online");
  const { logs: history } = useHistory(device.device_id, 10);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-2 w-2 rounded-full",
                status === "Online"
                  ? "bg-tertiary-fixed-dim shadow-[0_0_8px_rgba(0,224,184,0.5)]"
                  : "bg-error"
              )}
            />
            <p
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                status === "Online" ? "text-tertiary" : "text-error"
              )}
            >
              {status === "Online" ? "System Live" : "Maintenance Required"}
            </p>
          </div>
          <h3 className="font-h2 text-xl font-bold text-on-surface truncate max-w-[180px]">
            {device.device_name}
          </h3>
          <p className="text-xs font-mono text-outline">ID: {device.device_id}</p>
        </div>
        <button className="p-2 hover:bg-surface-container rounded-xl transition-colors text-outline">
          <MoreVertical size={18} />
        </button>
      </div>

      <div className="space-y-8 py-4">
        <MetricRow
          label="Voltage"
          value={telemetry?.voltage || "0.00"}
          unit="V"
          type="voltage"
          status={status}
          history={history}
        />
        <MetricRow
          label="Salinity"
          value={telemetry?.tds || "0.0"}
          unit="PSU"
          type="salinity"
          status={status}
          history={history}
        />
      </div>

      <div className="flex items-center justify-between px-1">
        <InfoTag
          label="Assigned To"
          value={device.assigned_user_name || "Unassigned"}
          icon={User}
        />
        <InfoTag label="Heartbeat" value="Active 30s ago" icon={Wifi} align="right" />
      </div>

      <button
        onClick={onViewAnalytics}
        className="group w-full py-4 ocean-gradient text-white font-bold text-sm tracking-wide hover:opacity-90 transition-opacity flex items-center justify-center gap-2 rounded-2xl"
      >
        <Activity size={16} />
        Full System Audit
        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
};
