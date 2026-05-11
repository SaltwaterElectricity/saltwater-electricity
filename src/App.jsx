import { useState } from 'react';
import { useAuth } from "./context/useAuth";
import { AnimatedLogo } from "./components"; 
import { AppRoutes } from "./route/AppRoutes"; 

function App() {
  const { loading } = useAuth();
  
  /**
   * isAnimationComplete State
   * Controls the transition from the interactive splash sequence to the main application.
   * Requirement: Ensure redirect only happens AFTER the animation completes.
   */
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Global Loading State + Splash Screen Logic
  // Render Splash if:
  // 1. Auth is still hydrating (loading)
  // 2. OR the splash animation sequence hasn't signaled completion (isAnimationComplete)
  if (loading || !isAnimationComplete) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white overflow-hidden fixed inset-0 z-[9999]">
        <AnimatedLogo onComplete={() => setIsAnimationComplete(true)} />
      </div>
    );
  }

  return (
    <AppRoutes />
  );
}

export default App;
