import { useEffect, useState } from 'react';
import { cn } from "../../utils/cn";

// 🕒 ANIMATION CONFIGURATION (8pt-friendly & industry standard)
const ANIMATION_TIMINGS = {
  SHINE_DELAY: 1200,   // Initial entrance delay
  LOOP_DELAY: 300,     // Gap between shine effect and floating loop
  ZOOM_DELAY: 6000,    // Duration of the looping animation
  EXIT_DURATION: 1000  // Transition time to Auth Page
};

const AnimatedLogo = ({ onComplete }) => {
  const [status, setStatus] = useState("idle"); // idle -> shining -> looping -> zoom

  useEffect(() => {
    // Utility function para sa cleaner delay logic
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    let isMounted = true; // Guard para sa memory leaks

    const runSequence = async () => {
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

      // 4. ZOOM -> COMPLETION (Redirect/Auth Page)
      await wait(ANIMATION_TIMINGS.EXIT_DURATION);
      if (!isMounted) return;
      if (onComplete) onComplete();
    };

    runSequence();

    // CLEANUP: Stop state updates kung nag-unmount ang component
    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-1000",
      status === "zoom" && "opacity-0 pointer-events-none"
    )}>
      
      {/* 1. LOGO SCENE CONTAINER (8pt: w-80, h-64) */}
      <div className={cn(
        "relative w-80 h-64 flex items-center justify-center [perspective:1500px] transition-transform duration-[1000ms] ease-in-out",
        status === "zoom" && "scale-[15] rotate-[-15deg]"
      )}>
        
        {/* DYNAMIC SHADOW (8pt: w-32, h-32) */}
        <div className={cn(
          "absolute w-32 h-32 bg-slate-300/40 blur-2xl rounded-full [transform:rotateX(90deg)_translateZ(-120px)] transition-opacity duration-1000",
          status !== "idle" ? "opacity-100 animate-shadow-pulse" : "opacity-0"
        )} />

        {/* THE CUBE (Logo - 8pt: w-40, h-40) */}
        <div className={cn(
          "relative w-40 h-40 [transform-style:preserve-3d] transition-all duration-700",
          status === "idle" ? "[transform:rotateX(-35.264deg)_rotateY(-45deg)]" : "animate-float-logo"
        )}>
          
          {/* FACE E (Top/Left) */}
          <div className="absolute inset-0 animate-fly-e [transform-style:preserve-3d]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 clip-e shadow-inner" />
            <div className={cn(
              "absolute inset-0 clip-e opacity-0 transition-opacity duration-500 bg-white/30 blur-sm",
              (status === "shining" || status === "looping") && "opacity-40"
            )} />
          </div>

          {/* FACE S (Front) */}
          <div className="absolute inset-0 animate-fly-s [transform-style:preserve-3d]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 clip-s" />
            <div className={cn(
              "absolute inset-0 clip-s opacity-0 transition-opacity duration-500 bg-white/30 blur-sm",
              (status === "shining" || status === "looping") && "opacity-40"
            )} />
          </div>

          {/* FACE M (Right) */}
          <div className="absolute inset-0 animate-fly-m [transform-style:preserve-3d]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-950 clip-m" />
            <div className={cn(
              "absolute inset-0 clip-m opacity-0 transition-opacity duration-500 bg-white/30 blur-sm",
              (status === "shining" || status === "looping") && "opacity-40"
            )} />
          </div>
        </div>
      </div>

      {/* 2. TEXT CONTAINER (8pt: -mt-4 = 16px, space-y-1 = 4px) */}
      <div className={cn(
        "text-center -mt-4 space-y-1 transition-all duration-1000 delay-[500ms]",
        status === "idle" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
        status === "zoom" && "opacity-0 -translate-y-10 scale-95"
      )}>
        <h1 className="text-2xl font-black tracking-[0.25em] bg-gradient-to-b from-slate-800 via-blue-900 to-black bg-clip-text text-transparent uppercase">
          Device Monitoring
        </h1>
        <h2 className="text-[12px] font-bold text-blue-600 uppercase tracking-[0.4em] opacity-80">
          Saltwater Electricity
        </h2>
      </div>
    </div>
  );
};

export default AnimatedLogo;