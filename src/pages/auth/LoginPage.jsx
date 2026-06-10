import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Undo2 } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import LoginForm from "../../components/auth/LoginForm";
import LoginHero from "../../components/auth/LoginHero";
import { AccessGrantedModal } from "../../components/modal";

const LoginPage = () => {
  const { currentUser } = useAuth();
  const [successData, setSuccessData] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  // 🛡️ SECURITY REDIRECT
  useEffect(() => {
    if (currentUser && !successData && !isTransitioning) {
      navigate("/", { replace: true });
    }
  }, [currentUser, successData, isTransitioning, navigate]);

  const handleLoginStart = useCallback(() => {
    setIsTransitioning(true);
  }, []);

  const handleLoginError = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const handleLoginSuccess = (data) => {
    setIsTransitioning(true);
    setSuccessData(data);
  };

  const handleRedirect = useCallback(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-[#f7f9fb] relative antialiased flex flex-col overflow-hidden">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 p-3 rounded-full bg-transparent hover:bg-white hover:shadow-lg border border-transparent hover:border-outline-variant/20 transition-all group z-50 flex items-center justify-center"
        aria-label="Go back to home"
      >
        <Undo2 className="w-5 h-5 text-outline group-hover:text-primary group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-secondary-container/5 rounded-full blur-[70px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-secondary-container/5 rounded-full blur-[70px]" />
      </div>

      {/* Main Entry Portal Content */}
      {!successData && (
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="flex flex-col md:flex-row items-center justify-center max-w-6xl w-full gap-12 md:gap-32 animate-in fade-in duration-500">
            {/* Left Side: Branding */}
            <div className="hidden md:block scale-110">
              <LoginHero />
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full max-w-[390px] relative z-10">
              <div className="glass-panel p-7 shadow-2xl border border-white/40 bg-white min-h-[490px] rounded-[18px] flex flex-col justify-center">
                <LoginForm
                  onLoginSuccess={handleLoginSuccess}
                  onLoginStart={handleLoginStart}
                  onLoginError={handleLoginError}
                />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Centered Modal for Successful Login */}
      <AccessGrantedModal
        key={successData ? "success" : "idle"}
        isOpen={!!successData}
        userData={successData}
        onFinished={handleRedirect}
      />
    </div>
  );
};

export default LoginPage;
