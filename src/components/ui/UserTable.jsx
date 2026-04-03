import { useFullUserData } from "../../hooks/useFullUserData";
import { cn } from "../../utils/cn";
import { memo } from "react";   
import { MapPin, Edit3, Trash2, RotateCcw, Users } from "lucide-react";

// 🛰️ Import your shared UI atom
import SpinnerIcon from "../../components/ui/SpinnerIcon";

// ==========================================
// 🧬 MOLECULE: Individual Real-Time Row
// ==========================================
const UserTableRow = memo(({ uid, onActionClick, onEditClick, searchTerm }) => {
  const { userData, loading } = useFullUserData(uid);

  if (loading) {
    return (
      <tr className="border-b border-slate-50">
        <td colSpan="3" className="px-8 py-6">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400 tracking-wider uppercase">
            <SpinnerIcon size="w-4 h-4" color="text-blue-600" />
            Synchronizing live state...
          </div>
        </td>
      </tr>
    );
  }

  const {
    firstName = "",
    lastName = "",
    email = "",
    status = "disabled",
    address = {}
  } = userData || {};

  const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
  const searchMatch = fullName.includes(searchTerm?.toLowerCase() || "") || email.toLowerCase().includes(searchTerm?.toLowerCase() || "");

  if (!searchMatch || !userData) return null;

  const isActive = status === "active";

  return (
    <tr className="hover:bg-blue-50/30 transition-colors group border-b border-slate-50 last:border-b-0">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-lg uppercase relative">
            {firstName[0]}{lastName[0]}
            <div className={cn(
              "absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white",
              isActive ? "bg-emerald-500" : "bg-slate-400"
            )} />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-none mb-1">
              {firstName} {lastName}
            </p>
            <span className={cn(
              "text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border",
              isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-500 border-slate-200"
            )}>
              {status}
            </span>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
          <div className="p-2 bg-slate-100 rounded-lg"><MapPin size={12} /></div>
          {address?.baranggay || "Unset Location"}
        </div>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex justify-end gap-2">
          <button 
            onClick={() => onEditClick(userData)}
            className="h-10 w-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 shadow-sm transition-all">
            <Edit3 size={18} />
          </button>
          <button 
            onClick={() => onActionClick(userData)}
            className={cn(
              "h-10 w-10 flex items-center justify-center bg-white border rounded-xl transition-all shadow-sm",
              isActive ? "text-slate-400 hover:text-red-600 border-slate-200" : "text-emerald-600 border-emerald-100 bg-emerald-50/50"
            )}
          >
            {isActive ? <Trash2 size={18} /> : <RotateCcw size={18} />}
          </button>
        </div>
      </td>
    </tr>
  );
});


// ==========================================
// 🏢 ORGANISM: Master User Table Component
// ==========================================
export const UserTable = ({ uids = [], onActionClick, onEditClick, searchTerm, activeView, currentUserRole }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {uids.length > 0 ? (
                uids.map((userOrId) => {
                    // 🛡️ Defend against objects! Pull the string UID if it's an object.
                    const finalUid = typeof userOrId === "object" ? (userOrId.uid || userOrId.id) : userOrId;

                    return (
                        <UserTableRow 
                            key={finalUid} 
                            uid={finalUid}
                            onEditClick={onEditClick} 
                            onActionClick={onActionClick}
                            searchTerm={searchTerm} 
                        />
                    );
                })
            ) : (
              <tr>
                <td colSpan="3" className="px-8 py-16 text-center antialiased">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-4">
                    <div className="p-4 bg-slate-100 rounded-2xl text-slate-400">
                      <Users size={32} />
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        No {activeView}s Registered Yet
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                        {activeView === "admin" 
                          ? "There are no administrators in the system facility yet." 
                          : "Get started by adding your first resident to the SmartAqua tracking system."}
                      </p>
                    </div>

                    {(() => {
                      const isSuperAdmin = currentUserRole === "superAdmin";
                      const isAdmin = currentUserRole === "admin";

                      if (activeView === "user" && (isAdmin || isSuperAdmin)) {
                        return (
                          <button 
                            onClick={() => window.location.href = "/admin/users/new"}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-sm transition-all"
                          >
                            + Register Resident
                          </button>
                        );
                      }

                      if (activeView === "admin" && isSuperAdmin) {
                        return (
                          <button 
                            onClick={() => window.location.href = "/admin/staff/new"}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-sm transition-all"
                          >
                            + Register Staff
                          </button>
                        );
                      }

                      return null;
                    })()}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};