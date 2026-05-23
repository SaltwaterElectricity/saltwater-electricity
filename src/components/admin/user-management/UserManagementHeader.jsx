import { memo } from "react";

/**
 * UserManagementHeader Component
 * Renders the page title and description for User Management.
 */
const UserManagementHeader = memo(() => {
  return (
    <div>
      <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase">
        User Management
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant">
        Manage all admin and household users within the monitoring system.
      </p>
    </div>
  );
});

UserManagementHeader.displayName = "UserManagementHeader";

export default UserManagementHeader;
