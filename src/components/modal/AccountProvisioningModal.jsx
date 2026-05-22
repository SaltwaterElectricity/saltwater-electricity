import { useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import { useNotification } from "../../context/useNotification";
import { useAuth } from "../../context/useAuth";

// Services
import { registerUserAccount, sendCredentials, deleteAuthUser } from "../../services/auth.service";
import { provisionUserSystem } from "../../services/user.service";
import { deleteApp } from "firebase/app";

// Constants & Components
import { ROLES } from "../../constants/roles";
import { RegistrationFields } from "../../components/auth/RegistrationField";
import { RegistrationSummary } from "../../components/auth/RegistrationSummary";
import { ConfirmationModal } from "./ConfirmationModal";
import ModalBackdrop from "./ModalBackdrop";

/**
 * AccountProvisioningModal Component
 * Modal form for registering both Staff (Admins) and standard Residents (Users).
 */
const AccountProvisioningModal = ({ isOpen, onClose, mode = "user" }) => {
  // STATES
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [tempData, setTempData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const { showNotification } = useNotification();
  const { userRole } = useAuth();

  // Mode-based UI configuration
  const isStaffMode = mode === "staff" || mode === "admin";
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

  if (!isOpen) return null;

  // PRE-SUBMIT: Opens confirmation modal
  const handlePreSubmit = (data) => {
    setServerError("");
    setTempData(data);
    setIsConfirmModalOpen(true);
  };

  // FINAL CONFIRMATION: Execution phase
  const handleFinalConfirm = async () => {
    if (!tempData || !tempData.email) {
      setServerError("Critical Error: Registration data is missing. Please restart the process.");
      showNotification("Data integrity check failed", "error");
      setIsConfirmModalOpen(false);
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
      setIsConfirmModalOpen(false);
      setTempData(null);
      reset();
      onClose();
    } catch (err) {
      // ERROR HANDLING
      const errorMsg = err.message || "An unexpected error occurred.";
      setServerError(errorMsg);
      showNotification(errorMsg, "error");
      setIsConfirmModalOpen(false);
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
    <ModalBackdrop>
      <div className="relative w-[95%] sm:w-full max-w-2xl bg-white border border-slate-200 rounded-[32px] shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
        >
          <X size={20} />
        </button>

        {/* HEADER SECTION */}
        <header className="mb-8 border-b border-slate-100 pb-6 pr-12">
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">
            {config.title}
          </h1>
          <p className="text-slate-500 mt-2 text-xs md:text-sm font-medium">
            {config.description}
          </p>
        </header>

        {/* ERROR DISPLAY */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] rounded-r-lg animate-pulse font-medium">
            <span className="font-bold uppercase tracking-wider mr-2">Security Alert:</span>
            {serverError}
          </div>
        )}

        {/* REGISTRATION FORM */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <form id="provision-form" onSubmit={handleSubmit(handlePreSubmit)} className="flex flex-col gap-8">
            <RegistrationFields register={register} errors={errors} currentUserRole={userRole} />
          </form>
        </div>

        {/* SUBMIT BUTTON SECTION */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-4">
          <button
            form="provision-form"
            type="submit"
            disabled={Object.keys(errors).length > 0 || isSubmitting}
            className={cn(
              "w-full font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2",
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
        </div>

        {/* REUSABLE CONFIRMATION MODAL */}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleFinalConfirm}
          isSubmitting={isSubmitting}
          title={config.modalTitle}
          description={config.modalDesc}
          confirmText="Finalize & Register"
        >
          <div className="max-h-[40vh] overflow-y-auto">
            <RegistrationSummary data={tempData} />
          </div>
        </ConfirmationModal>
      </div>
    </ModalBackdrop>
  );
};

export default AccountProvisioningModal;
