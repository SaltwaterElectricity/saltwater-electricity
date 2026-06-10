import { CheckCircle2 } from "lucide-react";
import { memo } from "react";
import { cn } from "../../utils/cn";

const RequirementItem = memo(({ label, isMet }) => (
  <div
    className={cn(
      "flex items-center gap-3 text-[13px] font-medium transition-colors duration-300",
      isMet ? "text-emerald-600" : "text-slate-400"
    )}
  >
    {isMet ? (
      <CheckCircle2 size={18} className="text-emerald-500 animate-in zoom-in duration-300" />
    ) : (
      <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-200 flex-shrink-0" />
    )}
    <span>{label}</span>
  </div>
));

RequirementItem.displayName = "RequirementItem";

const PasswordChecklist = ({ password = "" }) => {
  const requirements = [
    { label: "At least 12 characters long", met: password.length >= 12 },
    {
      label: "Includes uppercase & lowercase",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: "Includes at least one number", met: /\d/.test(password) },
    { label: "Includes a special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="space-y-3 mt-2 p-5 bg-slate-50/50 rounded-xl border border-slate-100">
      <h4 className="text-[10px] font-bold text-[#0b1c30] mb-3.5 uppercase tracking-wider">
        Password Requirements
      </h4>
      <div className="flex flex-col gap-3">
        {requirements.map((req) => (
          <RequirementItem key={req.label} label={req.label} isMet={req.met} />
        ))}
      </div>
    </div>
  );
};

const MemoizedPasswordChecklist = memo(PasswordChecklist);
MemoizedPasswordChecklist.displayName = "PasswordChecklist";
export default MemoizedPasswordChecklist;
