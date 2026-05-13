import { useState } from "react";
import { useForm } from "react-hook-form";
import { cn } from "../../utils/cn";
<<<<<<< HEAD
import { useNotification } from "../../context/useNotification";
=======
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

// Services
import { registerUserAccount } from "../../services/auth.service";
import { provisionUserSystem } from "../../services/user.service";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { X } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { ROLES } from "../../constants/roles";
import { RegistrationFields } from "../../components/auth/RegistrationField";
import { RegistrationSummary } from "../../components/auth/RegistrationSummary";
import { ConfirmationModal } from "../../components/modal/ConfirmationModal";
=======
import { X } from "lucide-react"; 
import { ROUTES } from "../../constants/routes";
import { RegistrationFields } from "../../components/auth/RegistrationField";
import { RegistrationSummary } from "../../components/auth/RegistrationSummary";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { Toast } from "../../components/ui";
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a

const AdminRegistration = () => {
  // STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempData, setTempData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
<<<<<<< HEAD
  const { showNotification } = useNotification();

  // FORM INITIALIZATION
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: ROLES.ADMIN,
      gender: "male",
      region: "Region IV-A",
      cityProvince: "Quezon",
      municipality: "San Andres",
      baranggay: "",
      birthDate: "",
    },
  });

  //PRE-SUBMIT
  const handlePreSubmit = (data) => {
    setServerError("");
=======

  // TOAST STATE
  const [toast, setToast] = useState({ 
    isOpen: false, 
    message: "", 
    type: "success" 
  });
  
  // FORM INITIALIZATION
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { 
      role: "admin", 
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
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    setTempData(data);
    setIsModalOpen(true);
  };

  // FINAL CONFIRMATION
<<<<<<< HEAD
=======

>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
  const handleFinalConfirm = async () => {
    // A. INTEGRITY CHECK
    if (!tempData || !tempData.email) {
      setServerError("Critical Error: Registration data is missing. Please restart the process.");
<<<<<<< HEAD
      showNotification("Data integrity check failed", "error");
=======
      showToast("Data integrity check failed", "error");
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
      setIsModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
<<<<<<< HEAD

=======
    
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    try {
      //AUTHENTICATION (Firebase Auth)
      const registrationResult = await registerUserAccount(tempData);

      //DATABASE PROVISIONING (Realtime Database)
<<<<<<< HEAD
      await provisionUserSystem(registrationResult.uid, {
        ...tempData,
        password: registrationResult.tempPassword,
=======
      await provisionUserSystem(registrationResult.uid, { 
        ...tempData, 
        password: registrationResult.tempPassword 
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
      });

      //SUCCESS NOTIFICATION & EMAIL FALLBACK
      if (!registrationResult.emailSent) {
        // Email failed pero ang account at database ay OK.
<<<<<<< HEAD
        showNotification(
          `Account created, but email failed. Temp Password: ${registrationResult.tempPassword}`,
          "warning"
        );
      } else {
        showNotification(
          `Staff account for ${tempData.firstName} has been fully provisioned!`,
          "success"
        );
      }

=======
        showToast(
          `Account created, but email failed. Temp Password: ${registrationResult.tempPassword}`, 
          "warning"
        );
      } else {
        showToast(`Staff account for ${tempData.firstName} has been fully provisioned!`, "success");
      }
      
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
      //CLEANUP
      setIsModalOpen(false);
      setTempData(null);
      reset(); // Resets React Hook Form states
<<<<<<< HEAD
=======

>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    } catch (err) {
      //ERROR HANDLING
      const errorMsg = err.message || "An unexpected error occurred.";
      setServerError(errorMsg);
<<<<<<< HEAD
      showNotification(errorMsg, "error");

      // Automatic scroll para agad makita ang error message sa taas ng form.
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsModalOpen(false);
=======
      showToast(errorMsg, "error");
      
      // Automatic scroll para agad makita ang error message sa taas ng form.
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsModalOpen(false); 
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    } finally {
      setIsSubmitting(false);
    }
  };
<<<<<<< HEAD

  return (
    <div className="max-w-4xl mx-auto p-8 my-8 bg-white border border-slate-200 rounded-3xl shadow-sm relative">
      <button
        onClick={() => navigate(ROUTES.ADMIN_USER_MANAGEMENT)}
=======
  
  return (
    <div className="max-w-4xl mx-auto p-8 my-8 bg-white border border-slate-200 rounded-3xl shadow-sm relative">
      <button 
        onClick={() => navigate(ROUTES.ADMIN_USER_MANAGEMENT)} // -1 para bumalik sa huling page o gamitin ang ROUTES.ADMIN_DASHBOARD
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
        className="absolute top-8 right-8 z-10 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        title="Back to Dashboard"
      >
        <X size={20} />
      </button>

      {/* HEADER SECTION */}
      <header className="mb-10 border-b border-slate-100 pb-8 pr-12">
<<<<<<< HEAD
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          System Staff Onboarding
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Automated registration: Credentials will be sent via email upon confirmation.
        </p>
=======
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Staff Onboarding</h1>
        <p className="text-slate-500 mt-2 text-sm">Automated registration: Credentials will be sent via email upon confirmation.</p>
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
      </header>

      {/* ERROR DISPLAY */}
      {serverError && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg animate-pulse">
<<<<<<< HEAD
          <span className="font-bold uppercase tracking-wider mr-2 text-[10px]">Error:</span>{" "}
          {serverError}
=======
          <span className="font-bold uppercase tracking-wider mr-2 text-[10px]">Error:</span> {serverError}
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
        </div>
      )}

      {/* REGISTRATION FORM */}
      <form onSubmit={handleSubmit(handlePreSubmit)} className="flex flex-col gap-10">
<<<<<<< HEAD
        {/* REUSABLE FIELDS COMPONENT */}
        <RegistrationFields register={register} errors={errors} isAdmin={true} />

        {/* SUBMIT BUTTON SECTION */}
        <div className="pt-6 border-t border-slate-100 space-y-6">
          <button
            type="submit"
            disabled={Object.keys(errors).length > 0}
            className={cn(
              "w-full font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2",
              Object.keys(errors).length > 0
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-black text-white active:scale-[0.98]"
            )}
          >
            Review & Register Staff
=======
        
        {/* REUSABLE FIELDS COMPONENT */}
        <RegistrationFields 
          register={register} 
          errors={errors} 
          isAdmin={true} 
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
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
          </button>

          {/* FOOTER SECURITY NOTE */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
<<<<<<< HEAD
              <strong>Security Notice:</strong> Credential provisioning is handled by the server.
=======
              <strong>Security Notice:</strong> Credential provisioning is handled by the server. 
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
              The staff will be prompted to change their password on first login.
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
        title="Confirm Staff Onboarding"
        description="Verify the information below. An automated email will be sent to the staff's work email."
        confirmText="Finalize & Register"
      >
        {/* INJECTED SUMMARY CONTENT */}
        <RegistrationSummary data={tempData} />
      </ConfirmationModal>
<<<<<<< HEAD
=======

      <Toast 
        isOpen={toast.isOpen} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, isOpen: false })} 
      />
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
    </div>
  );
};

<<<<<<< HEAD
export default AdminRegistration;
=======
export default AdminRegistration;
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
