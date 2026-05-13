import { SectionHeader } from "../../ui";

export const AccountabilitySection = ({ name, address, assignedAt }) => {
  const formatAddress = (addr) => {
    if (!addr) return "Not provided.";
    if (typeof addr === "string") return addr;
    return `${addr.street || ""}, ${addr.baranggay || ""}, ${addr.cityProvince || ""}`.replace(
      /^, /,
      ""
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      <SectionHeader title="Deployment Data" sub="Chain of custody and installation metadata" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-blue-50/40 rounded-3xl border border-blue-100/50 backdrop-blur-sm">
          <p className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">
            Assigned Representative
          </p>
          <p className="text-lg md:text-xl font-black text-blue-900 font-display italic">
            {name || "Awaiting Assignment"}
          </p>
          {assignedAt && (
            <p className="text-[10px] text-blue-600 font-bold mt-2 flex items-center gap-2 font-body-md">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
              Deployed on {new Date(assignedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-200/50 backdrop-blur-sm">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Node Location
          </p>
          <p className="text-xs md:text-sm text-slate-700 font-bold leading-relaxed font-body-md">
            {formatAddress(address)}
          </p>
        </div>
      </div>
    </div>
  );
};
