import LoginForm from "../../components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full bg-radial-glow relative antialiased grid place-items-center overflow-y-auto px-4 py-8">
      {/* Background Ornaments */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-secondary-container rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container rounded-full blur-[100px]" />
      </div>
      
      <div className="w-full max-w-[480px] bg-white p-8 md:p-8 rounded-[40px] shadow-[0_8px_32px_0_rgba(0,82,204,0.08)] flex flex-col relative">
        <div className="mb-8 text-center">
          <h1 className="text-[32px] font-['Space_Grotesk'] font-bold text-on-surface tracking-tight">
            Welcome Back
          </h1>
          <p className="font-['Inter'] text-[10px] font-bold text-outline uppercase tracking-widest mt-1">
            SALTWATER ELECTRICITY MONITORING SYSTEM
          </p>
        </div>

        <div className="w-full mb-8">
          <LoginForm />
        </div>

        <div className="text-center space-y-2">
          <p className="text-[12px] text-outline">
            New user? <a href="#" className="text-primary font-bold hover:underline">Request access</a>
          </p>
          <p className="text-[12px] text-outline">
            Having trouble? <a href="#" className="text-primary font-bold hover:underline">Contact Admin</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
