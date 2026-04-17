import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

// Services
import { registerUserAccount } from "../../services/auth.service";
import { provisionUserSystem } from "../../services/user.service";
import { ROUTES } from "../../constants/routes";
// UI Components
import { RegistrationFields } from "../../components/auth/RegistrationField";
import { RegistrationSummary } from "../../components/auth/RegistrationSummary";
import { ConfirmationModal } from "../../components/modal/ConfirmationModal";
import { Toast } from "../../components/ui";

const UserRegistration = () => {
  // STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempData, setTempData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  // TOAST STATE
  const [toast, setToast] = useState({ 
    isOpen: false, 
    message: "", 
    type: "success" 
  });
  
  // FORM INITIALIZATION
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { 
      role: "user", 
      gender: "male",
      region: "Region IV-A",
      cityProvince: "Quezon",
      baranggay: "" 
    }
  });

  // HELPER: Show Toast
  const showToast = (message, type = "success") => {
    setToast({ isOpen: true, message, type });
  };

   //PRE-SUBMIT
  const handlePreSubmit = (data) => {
    setServerError(""); 
    setTempData(data);
    setIsModalOpen(true);
  };

  // FINAL CONFIRMATION

  const handleFinalConfirm = async () => {
    // A. INTEGRITY CHECK
    if (!tempData || !tempData.email) {
      setServerError("Critical Error: Registration data is missing. Please restart the process.");
      showToast("Data integrity check failed", "error");
      setIsModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    
    try {
      //AUTHENTICATION (Firebase Auth)
      const registrationResult = await registerUserAccount(tempData);

      //DATABASE PROVISIONING (Realtime Database)
      await provisionUserSystem(registrationResult.uid, { 
        ...tempData, 
        password: registrationResult.tempPassword 
      });

      //SUCCESS NOTIFICATION & EMAIL FALLBACK
      if (!registrationResult.emailSent) {
        // Email failed pero ang account at database ay OK.
        showToast(
          `Account created, but email failed. Temp Password: ${registrationResult.tempPassword}`, 
          "warning"
        );
      } else {
        showToast(`User account for ${tempData.firstName} has been fully provisioned!`, "success");
      }
      
      //CLEANUP
      setIsModalOpen(false);
      setTempData(null);
      reset(); // Resets React Hook Form states

    } catch (err) {
      //ERROR HANDLING
      const errorMsg = err.message || "An unexpected error occurred.";
      setServerError(errorMsg);
      showToast(errorMsg, "error");
      
      // Automatic scroll para agad makita ang error message sa taas ng form.
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsModalOpen(false); 
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-8 my-8 bg-white border border-slate-200 rounded-3xl shadow-sm relative">
      <button 
        onClick={() => navigate(ROUTES.ADMIN_USER_MANAGEMENT)} 
        className="absolute top-8 right-8 z-10 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        title="Back to Dashboard"
      >
        <X size={20} />
      </button>

      {/* HEADER SECTION */}
      <header className="mb-10 border-b border-slate-100 pb-8 pr-12">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Account Provisioning</h1>
        <p className="text-slate-500 mt-2 text-sm">Register a new user to the SmartAqua system. Credentials will be sent via email.</p>
      </header>

      {/* ERROR DISPLAY */}
      {serverError && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg animate-pulse">
          <span className="font-bold uppercase tracking-wider mr-2 text-[10px]">Error:</span> {serverError}
        </div>
      )}

      {/* REGISTRATION FORM */}
      <form onSubmit={handleSubmit(handlePreSubmit)} className="flex flex-col gap-10">
        
        {/* REUSABLE FIELDS COMPONENT */}
        <RegistrationFields 
          register={register} 
          errors={errors} 
          isAdmin={false} 
        />

        {/* SUBMIT BUTTON SECTION */}
        <div className="pt-6 border-t border-slate-100 space-y-6">
          <button 
            type="submit"
            disabled={Object.keys(errors).length > 0} // <--- Dagdag na safety check
            className={cn(
              "w-full font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2",
              Object.keys(errors).length > 0 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                : "bg-slate-900 hover:bg-black text-white active:scale-[0.98]"
            )}
          >
            Review & Provision Staff
          </button>

          {/* FOOTER SECURITY NOTE */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              <strong>System Policy:</strong> Users will be required to update their temporary password upon their first login for security compliance.
            </p>
          </div>
        </div>
      </form>

      {/* REUSABLE CONFIRMATION MODAL */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleFinalConfirm}
        isSubmitting={isSubmitting}
        title="Confirm User Registration"
        description="Please verify the details below. Once confirmed, the system will generate an account and notify the user."
        confirmText="Finalize & Register"
      >
        {/* INJECTED SUMMARY CONTENT */}
        <RegistrationSummary data={tempData} />
      </ConfirmationModal>

      <Toast 
        isOpen={toast.isOpen} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, isOpen: false })} 
      />
    </div>
  );
};

export default UserRegistration;