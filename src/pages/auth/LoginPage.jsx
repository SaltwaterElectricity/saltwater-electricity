import { useState, useCallback } from "react";
import LoginModal from "../../components/modal/LoginModal";
import { ROLES } from "../../constants/roles";
import { cn } from "../../utils/cn";
import logoImg from "../../assets/logo-icon.png"; 

const LoginPage = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialRole, setInitialRole] = useState(ROLES.RESIDENT);

  const openLogin = useCallback((roleId) => {
    setInitialRole(roleId);
    setIsModalOpen(true);
  }, []);

  return (
    /* Ginamit ang 'auth-bg-active' mula sa iyong CSS base layer */
    <div className="min-h-screen w-full flex items-center justify-center auth-bg-active px-4 antialiased">
      
      <div className="bg-white w-full max-w-[380px] p-[45px_35px] rounded-xl text-center shadow-2xl animate-zoomIn">
        
        <div className="mb-2 flex flex-col items-center gap-2">
          <img 
            src={logoImg} 
            alt="SEM IoT Logo" 
            /* Ginamit ang 'animate-cube-jump' na ginawa natin sa CSS */
            className="w-[55%] max-w-[220px] h-auto -mt-2 animate-cube-jump"
          />
          <div className="text-center space-y-0">
            <h1 className="text-[16px] font-black tracking-[0.25em] bg-gradient-to-b from-slate-800 via-blue-900 to-black bg-clip-text text-transparent uppercase">
              Device Monitoring
            </h1>
            <h2 className="text-[8px] font-bold text-blue-600 uppercase tracking-[0.4em] opacity-80">
              Saltwater Electricity
            </h2>
          </div>
        </div>

        <div className=" mb-8">
          <h1 className="text-[22px] text-[#1a1a1a] font-bold mb-1.5">
            Hi, Electric User's
          </h1>
          <p className="text-[13px] text-black font-normal -mt-0.5">
            Please click or tap your destinations.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <button 
            onClick={() => openLogin(ROLES.ADMIN)}
            className={cn(
              "w-full py-3.5 text-lg font-medium rounded-lg transition-all duration-200 active:scale-95 shadow-md",
              "bg-[#000046] text-white hover:bg-[#000066]"
            )}
          >
            Administrator
          </button>
          
          <button 
            onClick={() => openLogin(ROLES.RESIDENT)}
            className={cn(
              "w-full py-3.5 text-lg font-medium rounded-lg transition-all duration-200 active:scale-95 shadow-sm",
              "bg-white text-[#2b308b] border-[1.5px] border-[#2b308b] hover:bg-[#f5f7ff]"
            )}
          >
            Household Representative
          </button>
        </div>


        <footer className="text-[12.5px] text-[#4d4d4d] leading-relaxed">
          By using this services, you understood and<br />
          agree to our Saltwater Electric online services<br />
          <span className="font-bold text-[#262626] cursor-pointer hover:underline">Terms of Use</span> and{" "}
          <span className="font-bold text-[#262626] cursor-pointer hover:underline">Privacy Statement</span>.
        </footer>
      </div>

      {/* LOGIN MODAL */}
      <LoginModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        defaultRole={initialRole}
      />
    </div>
  );
};

export default LoginPage;
