import { Link, useNavigate } from "react-router-dom";
import LoginHero from "../../components/auth/LoginHero";
import { ROUTES } from "../../constants/routes";
import { Footer } from "../../layout";
import "../../styles/landing.css";

/**
 * LandingPage Component
 * A public-facing landing page for the Saltwater Electricity IoT Monitoring System.
 * Fully synchronized with landingPage.html and global Tailwind 4 theme.
 */
const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen custom-scrollbar">
      {/* TopNavBar */}
      <nav className="sticky top-6 mx-auto w-[92%] rounded-full border-t border-l border-white/20 bg-surface/60 backdrop-blur-lg shadow-[0_8px_32px_0_rgba(0,101,145,0.1)] flex justify-between items-center px-8 py-3 max-w-7xl z-50 transition-all duration-300">
        <div className="flex flex-col">
          <span className="font-h3 text-h3 font-bold tracking-tight text-primary">
            SaltwaterElectricity
          </span>
          <span className="text-[10px] font-label-sm uppercase tracking-widest text-outline">
            iot-based monitoring system
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link
            className="font-body-md text-body-md text-primary font-semibold border-b-2 border-tertiary-container pb-1 transition-all duration-300"
            to={ROUTES.HOME}
          >
            Home
          </Link>
          <a
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-300"
            href="#features"
          >
            Features
          </a>
          <a
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-300"
            href="#about"
          >
            About Us
          </a>
          <a
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-all duration-300"
            href="#contact"
          >
            Contact
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(ROUTES.LOGIN)}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-body-md text-body-md font-semibold hover:backdrop-brightness-110 transition-all duration-300 shadow-lg shadow-primary/20 scale-95 active:scale-90"
          >
            Login Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-container-padding pt-24 pb-section-gap grid grid-cols-1 md:grid-cols-2 gap-gutter items-center relative">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed mb-stack-lg border border-primary/10 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span className="font-label-sm text-label-sm uppercase tracking-widest">
              renewable Energy. smart future.
            </span>
          </div>
          <h1 className="font-h1 text-h1 text-on-surface mb-stack-md">
            Smart Monitoring for <br />
            <span className="text-primary">Saltwater Energy</span>&nbsp;Device&apos;s
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg max-w-xl">
            Internet of Things - based Real-time monitoring and Intelligent Alert Notifications for
            safer, efficient and sustainable usage of Saltwater Electricity Devices.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="bg-primary text-on-primary px-10 py-3 rounded-full font-h3 text-body-lg font-bold shadow-xl shadow-primary/30 hover:scale-[1.05] active:scale-95 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Right Side: LoginHero with 3D Cube */}
        <div className="relative flex justify-center items-center">
          <div className="absolute w-[120%] h-[120%] bg-primary/5 rounded-full -z-10 blur-3xl" />
          <LoginHero />
        </div>
      </section>

      {/* Trust Bar (Marquee) */}
      <div className="w-full overflow-hidden bg-surface-container-low py-2 border-y border-outline-variant/30">
        <div className="animate-marquee whitespace-nowrap items-center">
          {/* First set of logos */}
          <div className="flex items-center gap-24 px-12 cursor-default">
            <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img
                alt="PUP Logo"
                className="h-10 w-auto object-contain mix-blend-multiply"
                src="https://lh3.googleusercontent.com/aida/ADBb0ujXGa9Kxu_0I92COfBtyRvfT1KxmRWuMue4zC9G8wj8RoGwDyW3HAVeOzmXtnZwYU4JxDL_8i9AxNu061u3Kp__aOF16W51N0cNTZTYgw7B2pS10jxazkdqSjc6uIY-XsuLeB_Rcx41BusHA788_wOgvXXS7d_S7TUYa1kMqvGJmXasZTwfh3Z_fntWs8hwCp8q5qxdtzLyQ0r9O9DMLf1TNbLFHuviUjqDgD9PKku33-q9LULkLF1_Ik4wRdbJXFYgr-SaiPXtdg"
              />
              <span className="font-h3 text-h5 font-bold tracking-tight text-on-surface whitespace-nowrap">
                Polytechnic University of the Philippines - Unisan Campus
              </span>
            </div>
            <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img
                alt="San Andres Logo"
                className="h-10 w-auto object-contain mix-blend-multiply"
                src="https://lh3.googleusercontent.com/aida/ADBb0ujVShPXChKs9w5j7hCP5v2u6HjbLLPd-jCOrDx_37PseEpVjs9HRYBOpVCmT-AVrOU8xfVeZvySn9v-vg9wgepQE-3otHsmZxc3KixF2hZTIHqqG3o_io1Xyw9yPuRc3ykULT89_KQAm32YzzOaYy3EXGARwcOjtPT5R9m00k1NgDNSQdptY7QuNVlN54vzyLhyvkPgL3Sv0gxw3zw7X_BAjg6jUp7pX8O6eWJvmiJ5N26zO3ZMKTjRzVA-42UxFAC9YgvgTkgo5Q"
              />
              <span className="font-h3 text-h5 font-bold tracking-tight text-on-surface whitespace-nowrap">
                Alibijaban Island, San Andres Municipality
              </span>
            </div>
            <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img
                alt="Saltwater Electricity Logo"
                className="h-10 w-auto object-contain mix-blend-multiply"
                src="https://lh3.googleusercontent.com/aida/ADBb0uiBW9VxrBJ87zGOeBMOhv_UlLw3atuL9HraUU-8rajJEyUXy6hO1MWfiO9uoZEB_fXnhvL1ubPqhQQBnVYZq12gVv7RC0cIYIDU-g1l4AmDbjKREFbueK0V1d0BM7-O96i05IjuWPoe41VS2BdfkvFhN4F5ucI2zKJulJSscJsEozvtneQ_LcQd3K_8XX4WNhBhWLhMyvf203PG-iBH5aXcMxyAw3mA9x1IZFVIQOsc7MsfYx7X5b1APiTJz1w-yVsBcrJ8rdyAQg"
              />
              <span className="font-h3 text-h5 font-bold tracking-tight text-on-surface whitespace-nowrap">
                Saltwater Electricity Device Monitoring
              </span>
            </div>
          </div>
          {/* Second set for seamless loop */}
          <div className="flex items-center gap-24 px-12 cursor-default">
            <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img
                alt="PUP Logo"
                className="h-10 w-auto object-contain mix-blend-multiply"
                src="https://lh3.googleusercontent.com/aida/ADBb0ujXGa9Kxu_0I92COfBtyRvfT1KxmRWuMue4zC9G8wj8RoGwDyW3HAVeOzmXtnZwYU4JxDL_8i9AxNu061u3Kp__aOF16W51N0cNTZTYgw7B2pS10jxazkdqSjc6uIY-XsuLeB_Rcx41BusHA788_wOgvXXS7d_S7TUYa1kMqvGJmXasZTwfh3Z_fntWs8hwCp8q5qxdtzLyQ0r9O9DMLf1TNbLFHuviUjqDgD9PKku33-q9LULkLF1_Ik4wRdbJXFYgr-SaiPXtdg"
              />
              <span className="font-h3 text-h5 font-bold tracking-tight text-on-surface whitespace-nowrap">
                Polytechnic University of the Philippines - Unisan Campus
              </span>
            </div>
            <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img
                alt="San Andres Logo"
                className="h-10 w-auto object-contain mix-blend-multiply"
                src="https://lh3.googleusercontent.com/aida/ADBb0ujVShPXChKs9w5j7hCP5v2u6HjbLLPd-jCOrDx_37PseEpVjs9HRYBOpVCmT-AVrOU8xfVeZvySn9v-vg9wgepQE-3otHsmZxc3KixF2hZTIHqqG3o_io1Xyw9yPuRc3ykULT89_KQAm32YzzOaYy3EXGARwcOjtPT5R9m00k1NgDNSQdptY7QuNVlN54vzyLhyvkPgL3Sv0gxw3zw7X_BAjg6jUp7pX8O6eWJvmiJ5N26zO3ZMKTjRzVA-42UxFAC9YgvgTkgo5Q"
              />
              <span className="font-h3 text-h5 font-bold tracking-tight text-on-surface whitespace-nowrap">
                Alibijaban Island, San Andres Municipality
              </span>
            </div>
            <div className="flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img
                alt="Saltwater Electricity Logo"
                className="h-10 w-auto object-contain mix-blend-multiply"
                src="https://lh3.googleusercontent.com/aida/ADBb0uiBW9VxrBJ87zGOeBMOhv_UlLw3atuL9HraUU-8rajJEyUXy6hO1MWfiO9uoZEB_fXnhvL1ubPqhQQBnVYZq12gVv7RC0cIYIDU-g1l4AmDbjKREFbueK0V1d0BM7-O96i05IjuWPoe41VS2BdfkvFhN4F5ucI2zKJulJSscJsEozvtneQ_LcQd3K_8XX4WNhBhWLhMyvf203PG-iBH5aXcMxyAw3mA9x1IZFVIQOsc7MsfYx7X5b1APiTJz1w-yVsBcrJ8rdyAQg"
              />
              <span className="font-h3 text-h5 font-bold tracking-tight text-on-surface whitespace-nowrap">
                Saltwater Electricity
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-container-padding py-section-gap">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-[10px] uppercase tracking-[0.2em] mb-4">
            Capabilities
          </div>
          <h2 className="font-h1 text-h2 md:text-h1 text-on-surface mb-6 tracking-tight uppercase">
            SYSTEM FEATURES
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-body-lg text-body-lg leading-relaxed">
            Our advanced saltwater monitoring ecosystem provides real-time oversight and intelligent
            automation, ensuring maximum efficiency for your marine energy assets.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Real-Time Monitoring */}
          <div className="glass-card p-8 rounded-[32px] border border-white/40 hover:border-primary/30 hover:bg-white/80 hover:shadow-[0_20px_50px_-12px_rgba(0,101,145,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-tertiary-container rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-on-primary text-[32px]">
                monitoring
              </span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-3 tracking-tight">
              Real-Time Monitoring
            </h3>
            <p className="font-body-md text-on-surface-variant">
              High-fidelity salinity and voltage telemetry streamed directly to your command center
              with sub-second latency.
            </p>
          </div>
          {/* Smart Alert System */}
          <div className="glass-card p-8 rounded-[32px] border border-white/40 hover:border-primary/30 hover:bg-white/80 hover:shadow-[0_20px_50px_-12px_rgba(0,101,145,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-tertiary-container rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-on-primary text-[32px]">
                notifications_active
              </span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-3 tracking-tight">
              Smart Alert System
            </h3>
            <p className="font-body-md text-on-surface-variant">
              Automated SMS and push notifications triggered by critical threshold breaches and
              system anomalies.
            </p>
          </div>
          {/* Multi-Site Monitoring */}
          <div className="glass-card p-8 rounded-[32px] border border-white/40 hover:border-primary/30 hover:bg-white/80 hover:shadow-[0_20px_50px_-12px_rgba(0,101,145,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-tertiary-container rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-on-primary text-[32px]">
                grid_view
              </span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-3 tracking-tight">
              Multi-Site Monitoring
            </h3>
            <p className="font-body-md text-on-surface-variant">
              Centralized oversight for geographically dispersed tidal arrays with aggregated
              performance analytics.
            </p>
          </div>
          {/* Mobile Accessibility */}
          <div className="glass-card p-8 rounded-[32px] border border-white/40 hover:border-primary/30 hover:bg-white/80 hover:shadow-[0_20px_50px_-12px_rgba(0,101,145,0.15)] transition-all duration-500 group relative overflow-hidden">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-tertiary-container rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-on-primary text-[32px]">
                smartphone
              </span>
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mb-3 tracking-tight">
              Mobile Accessibility
            </h3>
            <p className="font-body-md text-on-surface-variant">
              Secure, field-ready mobile access to critical system parameters and historical data
              trends on any device.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
