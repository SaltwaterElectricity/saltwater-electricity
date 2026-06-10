import { useState, useEffect } from "react";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "../../firebaseConfig";
import { Monitor, Smartphone, LogOut, Loader2, History } from "lucide-react";
import { cn } from "../../utils/cn";

export const SessionHistory = ({ uid }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const historyRef = query(ref(db, `/accounts/${uid}/loginHistory`), limitToLast(5));

    const unsubscribe = onValue(historyRef, (snapshot) => {
      const logs = [];
      snapshot.forEach((child) => {
        logs.unshift({ id: child.key, ...child.val() });
      });
      setHistory(logs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );

  return (
    <div className="z-20 space-y-5 px-6 pb-8 animate-in fade-in duration-500 mt-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mx-6">
        <div className="mb-6">
          <h3 className="font-display text-lg font-bold text-[#0b1c30]">
            Session <span className="text-primary">Activity</span>
          </h3>
          <p className="text-slate-500 text-[12px] mt-0.5">
            Recent login sessions associated with your account.
          </p>
        </div>

        <div className="space-y-3.5">
          {history.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <History className="w-8 h-8 text-slate-300 mx-auto mb-2.5" />
              <p className="text-slate-400 font-bold text-[12px]">No history found</p>
            </div>
          ) : (
            history.map((log, idx) => (
              <div
                key={log.id}
                className={cn(
                  "flex items-center justify-between p-4.5 rounded-xl border transition-all group",
                  idx === 0
                    ? "bg-[#eff4ff]/30 border-[#004ac6]/10 hover:border-[#004ac6]/30"
                    : "bg-white border-slate-100 hover:shadow-md"
                )}
              >
                <div className="flex items-center gap-4.5">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center border transition-transform group-hover:scale-105",
                      idx === 0
                        ? "bg-white text-primary border-slate-100 shadow-sm"
                        : "bg-slate-50 text-slate-400 border-slate-100"
                    )}
                  >
                    {log.device?.toLowerCase().includes("mac") ||
                    log.device?.toLowerCase().includes("windows") ? (
                      <Monitor size={24} />
                    ) : (
                      <Smartphone size={24} />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-display text-[15px] font-bold text-[#0b1c30]">
                        {log.device || "Unknown"}
                      </h4>
                      {idx === 0 && (
                        <span className="bg-[#004ac6]/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] font-medium text-slate-500">
                      {log.userAgent
                        ? log.userAgent.split(" ")[0] + " on " + log.device
                        : "Generic Browser"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {log.loginAt
                        ? new Date(log.loginAt).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Active"}
                    </p>
                  </div>
                </div>
                {idx !== 0 && (
                  <button className="text-slate-300 hover:text-red-500 transition-colors p-1.5">
                    <LogOut size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-6 p-5 bg-[#004ac6]/5 rounded-xl border border-[#004ac6]/10">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            <span className="font-bold text-[#004ac6]">Note:</span> Unrecognized activity? Update
            your password immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
