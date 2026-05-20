import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { useNotification } from "../../context/useNotification";

// Services
import { registerUserAccount, sendCredentials, deleteAuthUser } from "../../services/auth.service";
import { provisionUserSystem } from "../../services/user.service";
import { deleteApp } from "firebase/app";

// Constants & Components
import { ROUTES } from "../../constants/routes";
import { ROLES } from "../../constants/roles";
import { RegistrationFields } from "../../components/auth/RegistrationField";
import { RegistrationSummary } from "../../components/auth/RegistrationSummary";
import { ConfirmationModal } from "../../components/modal/ConfirmationModal";

const UserRegistration = () => {
  // STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempData, setTempData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // FORM INITIALIZATION
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: ROLES.RESIDENT,
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
    setTempData(data);
    setIsModalOpen(true);
  };

  // FINAL CONFIRMATION
  const handleFinalConfirm = async () => {
    // A. INTEGRITY CHECK
    if (!tempData || !tempData.email) {
      setServerError("Critical Error: Registration data is missing. Please restart the process.");
      showNotification("Data integrity check failed", "error");
      setIsModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    setServerError("");
    let regResult = null;

    try {
      // 1. AUTHENTICATION (Firebase Auth - Identity Only)
      regResult = await registerUserAccount(tempData);

      // 2. DATABASE PROVISIONING (Realtime Database)
      try {
        await provisionUserSystem(regResult.uid, {
          ...tempData,
          password: regResult.tempPassword,
        });
      } catch (dbError) {
        // 🚨 ROLLBACK: Delete the Auth user if DB setup fails to prevent orphaned accounts
        await deleteAuthUser(regResult.tempUser);
        throw new Error(
          `System Provisioning Failed: ${dbError.message || "Database connection error."}`
        );
      }

      // 3. SECURE CREDENTIAL DELIVERY (SendGrid - Only after DB success)
      await sendCredentials(tempData, regResult.tempPassword);

      //SUCCESS NOTIFICATION
      showNotification(
        `User account for ${tempData.firstName} has been fully provisioned!`,
        "success"
      );

      //CLEANUP
      setIsModalOpen(false);
      setTempData(null);
      reset();
    } catch (err) {
      //ERROR HANDLING
      const errorMsg = err.message || "An unexpected error occurred.";
      setServerError(errorMsg);
      showNotification(errorMsg, "error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsModalOpen(false);
    } finally {
      // 4. MEMORY MANAGEMENT: Always delete the temporary app instance
      if (regResult?.tempApp) {
        try {
          await deleteApp(regResult.tempApp);
        } catch (cleanupErr) {
          console.error("Temp app cleanup failed:", cleanupErr);
        }
      }
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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          User Account Provisioning
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Register a new user to the system. Credentials will be sent via email.
        </p>
      </header>

      {/* ERROR DISPLAY */}
      {serverError && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg animate-pulse">
          <span className="font-bold uppercase tracking-wider mr-2 text-[10px]">Error:</span>{" "}
          {serverError}
        </div>
      )}

      {/* REGISTRATION FORM */}
      <form onSubmit={handleSubmit(handlePreSubmit)} className="flex flex-col gap-10">
        {/* REUSABLE FIELDS COMPONENT */}
        <RegistrationFields register={register} errors={errors} isAdmin={false} />

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
            Review & Provision User
          </button>

          {/* FOOTER SECURITY NOTE */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              <strong>System Policy:</strong> Users will be required to update their temporary
              password upon their first login for security compliance.
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
    </div>
  );
};

export default UserRegistration;
