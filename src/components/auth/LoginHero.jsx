import { useState, useEffect, memo } from "react";
import { cn } from "../../utils/cn";

/**
 * LoginHero Component
 * Ported from landingPage.html branding section.
 * Features a CSS-based 3D animated cube logo and brand typography.
 * Managed via modular CSS (src/styles/components.css).
 */
const LoginHero = () => {
  const [status, setStatus] = useState("idle"); // idle -> shining -> looping

  useEffect(() => {
    // Initial entrance delay -> Shining
    const shineTimer = setTimeout(() => {
      setStatus("shining");

      // Shining -> Looping
      const loopTimer = setTimeout(() => {
        setStatus("looping");
      }, 400);

      return () => clearTimeout(loopTimer);
    }, 1200);

    return () => clearTimeout(shineTimer);
  }, []);

  return (
    <div className="logo-container">
      {/* 3D Cube Scene */}
      <div className="scene">
        <div
          id="logo-cube"
          className={cn(
            "cube",
            (status === "shining" || status === "looping") && "shining",
            status === "looping" && "looping"
          )}
        >
          {/* Top Face - E */}
          <div id="face-e" className="face-group">
            <div className="layer top-layer" />
          </div>

          {/* Front Face - S */}
          <div id="face-s" className="face-group">
            <div className="layer top-layer" />
          </div>

          {/* Left Face - M */}
          <div id="face-m" className="face-group">
            <div className="layer top-layer" />
          </div>
        </div>

        {/* Cube Dynamic Shadow */}
        <div className="cube-shadow" />
      </div>

      {/* Brand Typography */}
      <div className="text-container">
        <h1 className="cube-title uppercase">Device Monitoring</h1>
        <h2 className="cube-subtitle uppercase">Saltwater Electricity</h2>
      </div>
    </div>
  );
};

export default memo(LoginHero);
