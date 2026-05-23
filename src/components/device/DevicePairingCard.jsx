import { Plus } from "lucide-react";

/**
 * DevicePairingCard Component
 * Placeholder for pairing new hardware nodes.
 */
export const DevicePairingCard = () => {
  return (
    <div className="glass-panel rounded-[20px] p-6 flex flex-col items-center justify-center text-center h-[280px] group hover:border-primary-container hover:bg-primary-container/5 transition-all duration-300 cursor-pointer animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
        <Plus size={32} className="text-outline group-hover:text-primary" />
      </div>
      <div>
        <p className="font-h2 text-xl text-on-surface">New Connection</p>
        <p className="text-sm text-outline font-body-md">Pair a new sensor node via Bluetooth</p>
      </div>
    </div>
  );
};
