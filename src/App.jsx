import { useAuth } from "./context/AuthContext";
import { AuthSplashScreen } from "./components/auth";
import { AppRoutes } from "./AppRoutes"; 

function App() {
  const { loading } = useAuth();

  // Global Loading State
  if (loading) {
    return <AuthSplashScreen message="Synchronizing SmartAqua..." />;
  }

  // Mapapansin mo: Wala nang <Router> dito dahil nasa main.jsx na ito.
  return (
    <AppRoutes />
  );
}

export default App;