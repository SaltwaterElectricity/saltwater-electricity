import { StatusRow, SectionHeader } from "../../ui";

export const ConnectivitySection = ({ reading }) => (
  <div className="flex flex-col gap-8 animate-fade-in">
    <SectionHeader title="Device Health" sub="Connectivity and hardware operational state" />
    <div className="grid grid-cols-1 gap-4">
      <StatusRow label="Power Mode" value={reading?.power_mode || "Real-time"} status="Active" />
      <StatusRow
        label="System Status"
        value={reading?.is_maintenance ? "Maintenance" : "Operational"}
        status={reading?.is_maintenance ? "Warning" : "Stable"}
      />
      <StatusRow label="Heartbeat" value="Connected" status="Online" />
    </div>
  </div>
);
