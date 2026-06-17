import { memo } from "react";

/**
 * Footer Component
 * Professional footer synchronized with landingPage.html and global theme.
 * Extracted from LandingPage for layout modularity.
 */
export const Footer = memo(() => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30 pt-section-gap pb-12">
      <div className="max-w-7xl mx-auto px-container-padding">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-16">
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col items-start gap-4">
            <div className="flex flex-col">
              <span className="font-h3 text-h3 font-bold tracking-tight text-primary">
                SaltwaterElectricity
              </span>
              <span className="text-[10px] font-label-sm uppercase tracking-widest text-outline">
                iot- based monitoring system
              </span>
            </div>
            <p className="text-on-surface-variant text-body-md mt-4">
              Advanced saltwater electricity monitoring and real-time telemetry solutions for
              sustainable marine energy systems.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary-container hover:text-on-primary-container transition-all"
                href="#"
              >
                <span className="material-symbols-outlined">public</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary-container hover:text-on-primary-container transition-all"
                href="#"
              >
                <span className="material-symbols-outlined">mail</span>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h4 className="font-h3 text-body-md font-bold text-on-surface uppercase tracking-wider">
              Company
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  Our Mission
                </a>
              </li>
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  Developers
                </a>
              </li>
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 flex flex-col gap-6">
            <h4 className="font-h3 text-body-md font-bold text-on-surface uppercase tracking-wider">
              Marine Technology
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  Saltwater Electricity Devices
                </a>
              </li>
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  Real-time Monitoring
                </a>
              </li>
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  Alert Notification and Analytics
                </a>
              </li>
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  IoT Integration
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 flex flex-col gap-6">
            <h4 className="font-h3 text-body-md font-bold text-on-surface uppercase tracking-wider">
              Support & Social
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  Email Account
                </a>
              </li>
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  Youtube Account
                </a>
              </li>
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  Facebook Account
                </a>
              </li>
              <li>
                <a
                  className="text-on-surface-variant hover:text-primary transition-colors text-body-md"
                  href="#"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer Bar */}
        <div className="pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
            <a
              className="text-sm font-label-sm text-outline hover:text-primary transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-sm font-label-sm text-outline hover:text-primary transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-sm font-label-sm text-outline hover:text-primary transition-colors"
              href="#"
            >
              Security
            </a>
            <a
              className="text-sm font-label-sm text-outline hover:text-primary transition-colors"
              href="#"
            >
              Status
            </a>
          </div>
          <p className="text-sm font-label-sm text-outline">
            © 2026 SaltwaterElectricity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
