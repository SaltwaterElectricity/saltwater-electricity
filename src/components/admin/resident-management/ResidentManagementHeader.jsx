import { memo } from "react";

/**
 * ResidentManagementHeader Component
 * Renders the page title and description for Resident Management.
 */
const ResidentManagementHeader = memo(() => {
  return (
    <div>
      <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase">
        RESIDENT Management
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant">
        Manage all admin and household users within the monitoring system.
      </p>
    </div>
  );
});

ResidentManagementHeader.displayName = "ResidentManagementHeader";

export default ResidentManagementHeader;
