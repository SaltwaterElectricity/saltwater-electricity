import { useAuth } from '../../context/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { cn } from '../../utils/cn';

/**
 * Alerts Page
 * 
 * Displays a real-time list of system notifications and alerts.
 * Implements the 'Alon' Standard (Glassmorphism, 16px radius, Ocean Gradient accents).
 */
const Alerts = () => {
  const { currentUser, isAdmin } = useAuth();
  // If admin, we also want to see 'admin' alerts
  const { notifications, loading } = useNotifications(isAdmin ? 'admin' : currentUser?.uid);

  return (
    <div className="space-y-lg animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="mb-lg flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface mb-xs tracking-tight italic uppercase">System <span className="text-primary">Alerts</span></h2>
          <p className="font-['Inter'] text-body-md text-on-surface-variant">Real-time monitoring of facility notifications and security events.</p>
        </div>
        <div className="flex items-center space-x-2 bg-secondary-container/20 px-4 py-2 rounded-full border border-secondary-container/30">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary-fixed" />
          </span>
          <span className="font-['Inter'] text-label-sm font-bold text-primary uppercase tracking-widest">LIVE STREAM ACTIVE</span>
        </div>
      </div>

      {/* ALERTS FEED CONTAINER */}
      <div className="glass-panel min-h-[600px] flex flex-col overflow-hidden">
        <div className="p-md border-b border-white/40 flex justify-between items-center bg-white/30 backdrop-blur-md">
          <h3 className="font-h2 text-h2 text-primary uppercase tracking-tighter italic">Alert <span className='text-primary'>Feed</span></h3>
          <button className="text-label-sm font-bold text-primary hover:underline uppercase tracking-widest font-['Inter']">Mark All as Read</button>
        </div>

        <div className="flex-1 overflow-y-auto p-md space-y-4 custom-scrollbar bg-white/10">
          {loading ? (
            <div className='flex flex-col items-center justify-center py-32 gap-4 opacity-50'>
              <span className='material-symbols-outlined animate-spin text-4xl text-primary'>sync</span>
              <span className="text-label-sm font-bold text-outline uppercase tracking-[0.3em] font-['Inter']">Synchronizing Secure Stream...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-32 gap-6 opacity-30'>
              <span className='material-symbols-outlined text-6xl'>notifications_off</span>
              <div className='text-center'>
                <h4 className='font-h2 text-h2 text-primary uppercase'>No Active Alerts</h4>
                <p className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mt-1 font-['Inter']">Facility status is optimal</p>
              </div>
            </div>
          ) : (
            notifications.map((alert) => (
              <div 
                key={alert.id} 
                className={cn(
                  "p-6 rounded-[20px] border-l-4 transition-all duration-300 hover:translate-x-1 glass-panel shadow-sm group",
                  alert.type === 'critical' ? "bg-error-container/5 border-error" :
                  alert.type === 'warning' ? "bg-yellow-50/50 border-yellow-500" :
                  "bg-primary/5 border-primary"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                    alert.type === 'critical' ? "bg-error text-white" :
                    alert.type === 'warning' ? "bg-yellow-500 text-white" :
                    "bg-primary text-white"
                  )}>
                    <span className="material-symbols-outlined text-2xl">
                      {alert.type === 'critical' ? 'report' : alert.type === 'warning' ? 'warning' : 'info'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4 className="font-h2 text-sm text-primary uppercase tracking-wide truncate group-hover:text-secondary-container transition-colors">
                        {alert.title}
                      </h4>
                      <span className="text-label-sm font-bold text-outline whitespace-nowrap uppercase italic font-['Inter']">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-body-md text-on-surface-variant font-medium leading-relaxed italic font-['Inter']">
                      {alert.message}
                    </p>
                    {!alert.isRead && (
                       <div className="mt-3 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-label-sm font-black text-primary uppercase tracking-widest font-['Inter']">New Transmission</span>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER ACTION */}
        <div className="p-md text-center border-t border-white/40 bg-white/30 backdrop-blur-md">
          <p className="text-label-sm font-bold text-outline uppercase tracking-[0.25em] font-['Inter']">AlonKuryente Intelligence Grid • Security Node 01</p>
        </div>
      </div>
    </div>
  );
};

export default Alerts;