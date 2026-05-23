import { memo } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../../utils/cn";

/**
 * DeviceRequestProgress Component
 * Visualizes the lifecycle of a device request.
 */
const DeviceRequestProgress = memo(({ request }) => {
  if (!request) return null;

  const steps = [
    { id: 1, label: "Requested" },
    { id: 2, label: "Review" },
    { id: 3, label: "Request Validation" },
    { id: 4, label: "Device Ready" },
  ];

  // Logic to determine step states based on request.status
  let activeStep = 1;
  if (request.status === "pending") {
    activeStep = 2; // Requested is done, Review is in progress
  } else if (request.status === "approved") {
    activeStep = 4; // Requested, Review, Approved are done, Device Ready is in progress
  }

  return (
    <div className="bg-cardBg border border-outline-variant/30 rounded-3xl p-10 mb-12 shadow-premium animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-12">
        <h3 className="font-h2 text-xl text-on-surface">Active Request Pipeline</h3>
        <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          {request.deviceName} ONGOING
        </span>
      </div>
      <div className="relative flex items-center justify-between px-10">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-20 right-20 h-1 bg-outline-variant/20 -translate-y-1/2" />
        {/* Active Progress Line */}
        <div
          className="absolute top-6 left-20 h-1 bg-primary -translate-y-1/2 transition-all duration-1000"
          style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
        />

        {steps.map((step) => {
          const isComplete = step.id < activeStep;
          const isActive = step.id === activeStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                  isComplete
                    ? "bg-primary text-white shadow-lg"
                    : isActive
                      ? "bg-primary text-white shadow-lg animate-pulse"
                      : "bg-surface-container-high text-outline"
                )}
              >
                {isComplete ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <span className="font-h2 font-bold">{step.id}</span>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="font-h2 font-bold text-[10px] uppercase tracking-wider text-on-surface whitespace-nowrap">
                  {step.label}
                </p>
                <p
                  className={cn(
                    "text-[9px] font-bold uppercase mt-1",
                    isComplete
                      ? "text-primary"
                      : isActive
                        ? "text-primary animate-pulse"
                        : "text-outline"
                  )}
                >
                  {isComplete ? "COMPLETE" : isActive ? "IN PROGRESS" : "PENDING"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

DeviceRequestProgress.displayName = "DeviceRequestProgress";

export default DeviceRequestProgress;
