import { useState, useEffect } from "react";

/**
 * Hook: useCountUp
 * Animates a numeric value from zero to a target.
 *
 * @param {number} target - The final value to reach.
 * @param {number} duration - Animation duration in ms.
 * @param {number} decimals - Precision.
 */
export const useCountUp = (target, duration = 1500, decimals = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const endValue = parseFloat(target) || 0;
    const startValue = 0;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function: easeOutExpo
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentCount = startValue + easing * (endValue - startValue);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return count.toFixed(decimals);
};
