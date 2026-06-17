import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { useNotification } from "../../context/useNotification";
import { useAuth } from "../../context/useAuth";

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

/**
 * AccountProvisioning Component
 * Unified form for registering both Staff (Admins) and standard Residents (Users).
 * Adapts UI strings and role constraints based on the 'mode' prop and current user's role.
 */
const AccountProvisioning = ({ mode = "user" }) => {
  // Mode-based UI configuration
  const isStaffMode = mode === "staff";
  const config = {
    title: isStaffMode ? "System Staff Onboarding" : "User Account Provisioning",
    description: isStaffMode
      ? "Automated registration: Credentials will be sent via email upon confirmation."
      : "Register a new user to the system. Credentials will be sent via email.",
    buttonText: isStaffMode ? "Review & Provision Staff" : "Review & Provision User",
    successMsg: isStaffMode
      ? "Staff account has been fully provisioned!"
      : "User account has been fully provisioned!",
    modalTitle: isStaffMode ? "Confirm Staff Onboarding" : "Confirm User Registration",
    modalDesc: isStaffMode
      ? "Verify the information below. An automated email will be sent to the staff's work email."
      : "Please verify the details below. Once confirmed, the system will generate an account and notify the user.",
  };

  // STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempData, setTempData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { userRole } = useAuth();

  // FORM INITIALIZATION
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: isStaffMode ? ROLES.ADMIN : ROLES.RESIDENT,
      gender: "male",
      region: "Region IV-A",
      cityProvince: "Quezon",
      municipality: "San Andres",
      baranggay: "",
      birthDate: "",
    },
  });

  // PRE-SUBMIT: Opens confirmation modal
  const handlePreSubmit = (data) => {
    setServerError("");
    setTempData(data);
    setIsModalOpen(true);
  };

  // FINAL CONFIRMATION: Execution phase
  const handleFinalConfirm = async () => {
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
        // ROLLBACK: Delete the Auth user if DB setup fails
        await deleteAuthUser(regResult.tempUser);
        throw new Error(
          `System Provisioning Failed: ${dbError.message || "Database connection error."}`
        );
      }

      // 3. SECURE CREDENTIAL DELIVERY (SendGrid)
      await sendCredentials(tempData, regResult.tempPassword);

      // SUCCESS
      showNotification(`${tempData.firstName}'s account ${config.successMsg}`, "success");

      // CLEANUP
      setIsModalOpen(false);
      setTempData(null);
      reset();
      navigate(ROUTES.ADMIN_USER_MANAGEMENT);
    } catch (err) {
      // ERROR HANDLING
      const errorMsg = err.message || "An unexpected error occurred.";
      setServerError(errorMsg);
      showNotification(errorMsg, "error");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsModalOpen(false);
    } finally {
      // 4. MEMORY MANAGEMENT
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
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm relative animate-in fade-in slide-in-from-bottom-2 duration-500 p-8">
      <button
        onClick={() => navigate(ROUTES.ADMIN_USER_MANAGEMENT)}
        className="absolute top-8 right-8 z-10 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        title="Back to Dashboard"
      >
        <X size={20} />
      </button>

      {/* HEADER SECTION */}
      <header className="mb-10 border-b border-slate-100 pb-8 pr-12">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{config.title}</h1>
        <p className="text-slate-500 mt-2 text-sm italic">{config.description}</p>
      </header>

      {/* ERROR DISPLAY */}
      {serverError && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg animate-pulse font-medium">
          <span className="font-bold uppercase tracking-wider mr-2 text-[10px]">
            Security Alert:
          </span>{" "}
          {serverError}
        </div>
      )}

      {/* REGISTRATION FORM */}
      <form onSubmit={handleSubmit(handlePreSubmit)} className="flex flex-col gap-10">
        {/* REUSABLE FIELDS COMPONENT */}
        <RegistrationFields register={register} errors={errors} currentUserRole={userRole} />

        {/* SUBMIT BUTTON SECTION */}
        <div className="pt-6 border-t border-slate-100 space-y-6">
          <button
            type="submit"
            disabled={Object.keys(errors).length > 0 || isSubmitting}
            className={cn(
              "w-full font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2",
              Object.keys(errors).length > 0 || isSubmitting
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-slate-900 hover:bg-black text-white active:scale-[0.98]"
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              config.buttonText
            )}
          </button>

          {/* FOOTER SECURITY NOTE */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium italic">
              <strong>Data Privacy Notice:</strong> Credential provisioning is handled securely via
              SendGrid. Recipients will be required to update their temporary password upon first
              login.
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
        title={config.modalTitle}
        description={config.modalDesc}
        confirmText="Finalize & Register"
      >
        {/* INJECTED SUMMARY CONTENT WITH HEIGHT CONSTRAINT */}
        <div className="max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
          <RegistrationSummary data={tempData} />
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default AccountProvisioning;
