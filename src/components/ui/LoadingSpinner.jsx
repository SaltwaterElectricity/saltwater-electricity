import SpinnerIcon from "./SpinnerIcon";
import { memo } from "react";

/**
 * MOLECULE: LoadingSpinner
 * Used for full-page states like AuthSplashScreen.
 */
const LoadingSpinner = ({ message = "Loading...", size = "w-12 h-12" }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
      {/* 8pt Grid (w-12 = 48px) - Uses the SVG Atom for better performance */}
      <SpinnerIcon size={size} color="text-blue-600" />
      
      {/* Message logic: IoT professional look */}
      {message && (
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
const MemoizedLoadingSpinner = memo(LoadingSpinner);
export default MemoizedLoadingSpinner;
