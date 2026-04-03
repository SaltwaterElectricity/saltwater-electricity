import { useState, useEffect } from "react";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "../../firebaseConfig";

export const SessionHistory = ({ uid }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    // Kunin lamang ang huling 5 logins para iwas memory overflow
    const historyRef = query(ref(db, `/accounts/${uid}/loginHistory`), limitToLast(5));

    const unsubscribe = onValue(historyRef, (snapshot) => {
      const logs = [];
      snapshot.forEach((child) => {
        logs.unshift({ id: child.key, ...child.val() }); // Bagong logs sa itaas
      });
      setHistory(logs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  if (loading) return <span className="text-xs text-slate-400">Loading history...</span>;

  return (
    <div className="space-y-4 animate-in fade-in duration-300 mt-6">
      <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Recent Devices Authenticated</h3>
        <span className="text-[10px] font-bold text-slate-400">Last 5 Sessions</span>
      </div>

      <div className="space-y-2">
        {history.length === 0 ? (
          <p className="text-xs text-slate-400">No session logs found.</p>
        ) : (
          history.map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">{log.device}</p>
                <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{log.userAgent}</p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                {log.loginAt ? new Date(log.loginAt).toLocaleString() : "Syncing..."}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};