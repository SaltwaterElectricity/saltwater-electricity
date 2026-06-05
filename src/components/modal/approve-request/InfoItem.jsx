import { cn } from "../../../utils/cn";

/**
 * InfoItem Component
 * Mirrors the household user info items from code1.html.
 */
const InfoItem = ({ icon: Icon, label, value, isEmail }) => (
  <div className="flex gap-3">
    <div className="text-blue-600 pt-0.5 shrink-0">
      <Icon size={16} />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="block text-[10px] text-slate-400 font-medium leading-none mb-1">
        {label}
      </span>
      <span
        className={cn(
          "block font-semibold text-slate-700 truncate text-xs",
          isEmail && "text-blue-600"
        )}
      >
        {value}
      </span>
    </div>
  </div>
);

export default InfoItem;
