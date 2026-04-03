import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layout & Security Components
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { AuthSplashScreen } from "./components/auth";
import { ForcePasswordChange } from "./components/passwordChange";

// Pages
import AdminRegistration from "./pages/admin/AdminRegistration";
import UserRegistration from "./pages/admin/UserRegistration"; 
import LoginPage from "./pages/auth/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";

/**
 * ROOT REDIRECTOR: Determines landing page based on Role
 */
const RootRedirect = ({ user, role }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (!role) return <Navigate to="/unauthorized" replace />;
  
  // Role-based landing logic
  const dashboardMap = {
    superAdmin: "/admin/dashboard",
    admin: "/admin/dashboard",
    technician: "/tech/controls",
    user: "/dashboard" // Landing for Residents
  };

  return <Navigate to={dashboardMap[role] || "/unauthorized"} replace />;
};

function App() {
  const { currentUser, userRole, loading, mustChangePassword } = useAuth();
  console.log("App Render State:", { currentUser: !!currentUser, userRole, loading });

  if (loading) {
    return <AuthSplashScreen message="Synchronizing SmartAqua..." />;
  }

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/security-checkpoint" element={mustChangePassword ? <ForcePasswordChange /> : <Navigate to="/" replace />} />

      {/* 3. PROTECTED ROUTES GROUP */}
      <Route element={<ProtectedRoute />}> 
        <Route element={<MainLayout />}>

          <Route path="/" element={<RootRedirect user={currentUser} role={userRole} />} />
          
          {/* 🔑 ADMIN SCOPE: Gumamit ng "requiredRole" props nang maayos */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard currentUserRole={userRole} />} />
            <Route path="/admin/users/new" element={<UserRegistration />} />
          </Route>

          {/* 🔑 SUPER ADMIN SCOPE */}
          <Route element={<ProtectedRoute requiredRole="superAdmin" />}>
            <Route path="/admin/staff/new" element={<AdminRegistration />} />
          </Route>

          {/* RESIDENT SCOPE */}
          <Route path="/dashboard" element={<div>Resident Dashboard (Coming Soon)</div>} />
        </Route>
      </Route>

      {/* SYSTEM FLOW & ERROR HANDLING */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4 font-sans antialiased">
      <div className="text-slate-200 font-black text-8xl tracking-tighter animate-pulse">403</div>
      <div className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
        Access Denied - Security Clearance Required
      </div>
      <button 
        onClick={() => navigate("/")}
        className="text-[9px] font-black uppercase text-blue-600 hover:underline tracking-widest mt-4"
      >
        Return to Safety
      </button>
    </div>
  );
};

export default App;