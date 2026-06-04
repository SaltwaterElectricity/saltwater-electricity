import { memo, useMemo } from "react";

/**
 * WelcomeSection Component
 * Displays a time-aware greeting and a localized welcome message.
 */
const WelcomeSection = memo(({ firstName }) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  return (
    <section className="mb-stack-lg">
      <h3 className="text-headline-lg font-bold text-on-surface">
        {greeting}, {firstName || "Resident"}!
      </h3>
      <p className="text-body-lg text-on-surface-variant mt-1 font-body-lg">
        Here’s what’s happening with your saltwater electricity system today.
      </p>
    </section>
  );
});

WelcomeSection.displayName = "WelcomeSection";

export default WelcomeSection;
