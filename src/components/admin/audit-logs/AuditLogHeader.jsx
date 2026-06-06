import { memo } from "react";

/**
 * AuditLogHeader Component
 * Title and description for the audit log module.
 */
const AuditLogHeader = () => {
  return (
    <header className="flex flex-col lg:flex-row justify-between items-start mb-8 gap-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mt-8">
          Audit <span className="text-primary">Logs</span>
        </h2>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl leading-relaxed">
          Monitor user activities, security events, device actions, and system operations across the
          platform.
        </p>
      </div>
    </header>
  );
};

export default memo(AuditLogHeader);
