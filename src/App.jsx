import React, { useState, useEffect } from 'react';
import { useAuth } from "./context/AuthContext";
import AnimatedLogo from "./components/ui/AnimatedLogo"; // Siguraduhing tama ang path
import { AppRoutes } from "./AppRoutes"; 

function App() {
  const { loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Nag-set tayo ng 3.5s to 4s para makita ang buong animation 
    // ng Internet of Things logo bago mag-proceed.
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Global Loading State + Splash Screen Logic
  // Lalabas ito hangga't (nag-lo-load ang Auth) O (hindi pa tapos ang splash timer)
  if (loading || showSplash) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white animate-zoomIn transition-colors duration-500">
        <AnimatedLogo />
      </div>
    );
  }

  return (
    <AppRoutes />
  );
}

export default App;