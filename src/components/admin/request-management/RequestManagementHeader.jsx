import { memo } from "react";

/**
 * RequestManagementHeader Component
 * Renders the page header for Request Validation.
 * Aligned with the 'code.html' design specifications.
 */
const RequestManagementHeader = memo(() => {
  return (
    <div className="flex flex-col">
      <h2 className="font-['Inter'] text-3xl text-slate-900 font-extrabold tracking-tight">
        <span className="text-black">REQUEST</span>{" "}
        <span className="text-blue-600">VALIDATION</span>
      </h2>
      <p className="text-slate-500 mt-2 max-w-2xl font-medium text-sm md:text-base">
        Monitor and manage incoming device and user requests with Saltwater Electricity Monitoring System.
      </p>
    </div>
  );
});

RequestManagementHeader.displayName = "RequestManagementHeader";

export default RequestManagementHeader;
