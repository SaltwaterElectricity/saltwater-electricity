import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import LoginHero from "../../components/auth/LoginHero";
import { AccessGrantedModal } from "../../components/modal";

const LoginPage = () => {
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f9fb] relative antialiased flex flex-col overflow-hidden">
      
      {/* Background Decorative Gradients (Maritime Vibe) */}
      {!successData && (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          {/* Accent Blurs from code.html */}
          <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-secondary-container/5 rounded-full blur-[70px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-secondary-container/5 rounded-full blur-[70px]" />
        </div>
      )}

      {/* Main Entry Portal Content */}
      {!successData && (
        <main className="flex-grow flex items-center justify-center px-6">
          <div className="flex flex-col md:flex-row items-center justify-center max-w-6xl w-full gap-12 md:gap-32">
            
            {/* Left Side: Branding */}
            <div className="hidden md:block scale-110">
              <LoginHero />
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full max-w-[390px] relative z-10">
              <div className="glass-panel p-7 shadow-2xl border border-white/40 bg-white min-h-[490px] rounded-[18px] flex flex-col">
                
                <div className="text-center mb-5">
                  <h1 className="text-2xl font-bold text-on-surface mb-2 font-display">
                    Welcome Back
                  </h1>
                  <p className="text-outline text-xs font-body-md">
                    Saltwater Device Monitoring
                  </p>
                  <p className="text-outline text-[11px] font-medium mt-1 font-body-md">
                    Please enter the needed information.
                  </p>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <LoginForm onLoginSuccess={setSuccessData} />
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Centered Modal for Successful Login */}
      <AccessGrantedModal 
        isOpen={!!successData} 
        userData={successData} 
        onFinished={handleRedirect} 
      />
    </div>
  );
};

export default LoginPage;
