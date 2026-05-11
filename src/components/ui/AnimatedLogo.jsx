import { useEffect, useState } from 'react';
import { cn } from "../../utils/cn";

/**
 * AnimatedLogo Component
 * Premium 3D branding sequence for Smart Aqua Monitor.
 * Standardized on 8pt grid with Glassmorphism highlights.
 */

// 🕒 ANIMATION CONFIGURATION
const ANIMATION_TIMINGS = {
  SHINE_DELAY: 1200,   // Initial entrance delay
  LOOP_DELAY: 300,     // Gap between shine effect and floating loop
  ZOOM_DELAY: 6000,    // Duration of the looping animation
  EXIT_DURATION: 1200  // Transition time to next state
};

const AnimatedLogo = ({ onComplete }) => {
  const [status, setStatus] = useState("idle"); // idle -> shining -> looping -> zoom

  useEffect(() => {
    // 📱 Cordova/Capacitor: Hide the native splash screen once the React component is ready
    if (typeof navigator !== 'undefined' && navigator.splashscreen) {
      navigator.splashscreen.hide();
    }

    // Utility function for cleaner delay logic
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let isMounted = true;

    const runSequence = async () => {
      // Reset state if we were to loop (though we usually exit)
      setStatus("idle");
      await wait(50); // small tick to ensure DOM updates if resetting

      // 1. SEQUENCE START: Initial Delay -> Shining
      await wait(ANIMATION_TIMINGS.SHINE_DELAY);
      if (!isMounted) return;
      setStatus("shining");

      // 2. SHINING -> LOOPING
      await wait(ANIMATION_TIMINGS.LOOP_DELAY);
      if (!isMounted) return;
      setStatus("looping");

      // 3. LOOPING -> ZOOM
      await wait(ANIMATION_TIMINGS.ZOOM_DELAY);
      if (!isMounted) return;
      setStatus("zoom");

      // 4. ZOOM -> COMPLETION
      await wait(ANIMATION_TIMINGS.EXIT_DURATION);
      if (!isMounted) return;
      
      if (onComplete) {
        onComplete();
      } else {
        // If no onComplete, loop like the original snippet
        runSequence();
      }
    };

    runSequence();

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      <div className="logo-container" id="intro-container">
        <div className="splash-scene">
          <div className="cube-shadow" />

          {/* Moved text-container inside full-cube-zoom-layer to ensure it zooms with the cube */}
          <div 
            id="full-cube-zoom-layer" 
            className={cn(
              "flex flex-col items-center justify-center gap-12",
              status === "zoom" && "perform-full-zoom"
            )}
          >
            <div className={cn("cube", (status === "shining" || status === "looping") && "shining", status === "looping" && "looping")} id="logo-cube">
              <div className="face-group" id="face-e">
                <div className="layer top-layer" />
              </div>
              <div className="face-group" id="face-s">
                <div className="layer top-layer" />
              </div>
              <div className="face-group" id="face-m">
                <div className="layer top-layer" />
              </div>
            </div>

            <div className="text-container">
              <h1 className="cube-title uppercase">Device Monitoring</h1>
              <h2 className="cube-subtitle uppercase">Saltwater Electricity</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLogo;
