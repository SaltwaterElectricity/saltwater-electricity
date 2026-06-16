import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "../../../constants/routes";
import { useProfile } from "../../../hooks/useProfile";

/**
 * RequestItem Sub-component
 * Hydrates requester name for the widget.
 */
const RequestItem = ({ request }) => {
  const navigate = useNavigate();
  const { profile, loading } = useProfile(request.userId);

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "Loading...";

  return (
    <div className="pb-6 border-b border-outline-variant/20 last:border-0 last:pb-0 border border-outline-variant/30 rounded-xl p-4">
      <div className="text-center mb-4">
        <p className="text-base font-bold text-on-surface">{loading ? "..." : fullName}</p>
        <p className="text-[11px] text-outline mt-1">
          {new Date(request.createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
          })}{" "}
          •{" "}
          {new Date(request.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => navigate(ROUTES.ADMIN_REQUEST_MANAGEMENT)}
          className="w-full py-2.5 px-4 bg-primary text-white font-bold text-[11px] rounded-lg shadow-sm hover:brightness-110 transition-all"
        >
          Request Review
        </button>
      </div>
    </div>
  );
};

/**
 * DeviceRequestWidget Component
 * Mirrors the "DEVICE REQUEST" section from dashboard.html.
 */
const DeviceRequestWidget = memo(({ requests = [] }) => {
  const navigate = useNavigate();
  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col">
      <h3 className="font-bold text-sm uppercase tracking-wider text-on-surface-variant mb-6 text-center">
        DEVICE REQUEST
      </h3>
      <div className="space-y-6 flex-1">
        {pendingRequests.slice(0, 2).map((req) => (
          <RequestItem key={req.id} request={req} />
        ))}
        {pendingRequests.length === 0 && (
          <p className="text-center py-10 text-[11px] font-bold text-outline uppercase tracking-widest">
            No pending requests
          </p>
        )}
      </div>
      <div className="mt-6">
        <button
          onClick={() => navigate(ROUTES.ADMIN_REQUEST_MANAGEMENT)}
          className="w-full text-primary font-bold text-xs flex items-center justify-center gap-2 py-3 border border-primary/10 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all"
        >
          View all requests <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});

DeviceRequestWidget.displayName = "DeviceRequestWidget";

export default DeviceRequestWidget;
