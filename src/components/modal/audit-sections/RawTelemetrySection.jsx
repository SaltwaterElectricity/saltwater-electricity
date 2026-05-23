import { cn } from "../../../utils/cn";
import { SectionHeader } from "../../ui";

export const RawTelemetrySection = ({ logs }) => (
  <div className="flex flex-col gap-8 animate-fade-in min-w-0">
    <SectionHeader title="Raw Logs" sub="Unfiltered telemetry data audit trail" />
    <div className="overflow-x-auto overflow-y-hidden custom-scrollbar rounded-2xl border border-slate-100 bg-white shadow-sm w-full">
      <table className="w-full min-w-[500px] text-left border-collapse">
        <thead className="bg-slate-50 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 font-body-md">
          <tr>
            <th className="p-4 w-1/4">Time</th>
            <th className="p-4 w-1/4 text-center">TDS</th>
            <th className="p-4 w-1/4 text-center">Volt</th>
            <th className="p-4 w-1/4 text-right">Relay</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 font-body-md">
          {logs.slice(0, 15).map((log) => (
            <tr
              key={log.id}
              className="text-[10px] md:text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <td className="p-4 whitespace-nowrap">
                {new Date(log.__normalizedTs).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </td>
              <td className="p-4 text-center font-mono text-blue-600">{log.tds_ppm}</td>
              <td className="p-4 text-center font-mono text-slate-400">{log.voltage}V</td>
              <td className="p-4 text-right">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] md:text-[9px] uppercase tracking-tighter",
                    log.relay_active
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-slate-50 text-slate-400 border border-slate-100"
                  )}
                >
                  {log.relay_active ? "ON" : "OFF"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
