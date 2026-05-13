/**
 * DiscoveryCard
 * A premium UI component for available hardware nodes.
 * MAC address is hidden from UI for a cleaner look and security,
 * but preserved in logic for registration.
 */
const DiscoveryCard = ({ device, onSelect }) => {
  // 1. Destructure - We still need 'id' (MAC) for the onClick logic
  const { id, deviceName } = device;
  const displayName = deviceName || "Generic Node";

  return (
    <button
      onClick={() => onSelect(device)}
      className="group relative w-full text-left bg-white rounded-[2rem] p-1 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-200/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-500/20"
      aria-label={`Register ${displayName}`}
    >
      {/* Decorative Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-7 bg-white rounded-[1.8rem] h-full flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-8">
            {/* Icon Container with subtle animation */}
            <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">
                Available
              </span>
            </div>
          </div>

          {/* Device Name - The primary visual anchor */}
          <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
            {displayName}
          </h3>
          <p className="text-sm text-gray-400 font-medium">New node detected on mesh</p>
        </div>

        {/* Footer Info */}
        <div className="mt-10 flex items-center justify-between border-t border-gray-50 pt-6">
          <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors flex items-center gap-2">
            Configure Device
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </span>

          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full bg-blue-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-400">
              {/* Optional: Small visual identifier like the first character of ID */}
              {id.substring(0, 1)}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default DiscoveryCard;
