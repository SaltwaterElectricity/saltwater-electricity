import { memo } from "react";

/**
 * RequestManagementHeader Component
 * Renders the page header for Request Validation.
 * Aligned with the 'code.html' design specifications.
 */
const RequestManagementHeader = memo(() => {
  return (
    <div className="w-full flex flex-col text-left">
      <h2 className="font-headline-lg text-3xl text-on-background font-extrabold tracking-tight">
        <span className="text-black">REQUEST</span> <span className="text-primary">VALIDATION</span>
      </h2>
      <p className="text-body-md text-on-surface-variant mt-2 font-medium">
        Monitor and manage incoming device and user requests with Saltwater Electricity Monitoring
        System.
      </p>
    </div>
  );
});

RequestManagementHeader.displayName = "RequestManagementHeader";

export default RequestManagementHeader;
