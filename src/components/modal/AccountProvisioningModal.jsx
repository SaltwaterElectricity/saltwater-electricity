import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { cn } from "../../utils/cn";
import { useNotification } from "../../context/useNotification";
import { useAuth } from "../../context/useAuth";

// Services
import { registerUserAccount, sendCredentials, deleteAuthUser } from "../../services/auth.service";
import { provisionUserSystem } from "../../services/user.service";
import { deleteApp } from "firebase/app";

// Constants & Components
import { ROLES } from "../../constants/roles";
import {
  RegistrationFields,
  RegistrationSummary,
  ConfirmationModal,
} from "../../components";
import ModalBackdrop from "./ModalBackdrop";

/**
 * AccountProvisioningModal Component
 * Mirroring code1.html premium two-column design.
 * Features a live summary card that updates as the admin fills the form.
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
    titlePrefix: isStaffMode ? "System Staff" : "User Account",
    titleSuffix: "Provisioning",
    description: isStaffMode
      ? "Register a new staff member to the enterprise console. Credentials will be dispatched via secure email."
      : "Register a new resident to the system. Automated credentials will be generated upon confirmation.",
    buttonText: isStaffMode ? "Review & Provision Staff" : "Review & Provision User",
    successMsg: isStaffMode
      ? "Staff account has been fully provisioned!"
      : "User account has been fully provisioned!",
    modalTitle: isStaffMode ? "Confirm Staff Onboarding" : "Confirm User Registration",
    modalDesc: isStaffMode
      ? "Verify the staff information below. An automated provisioning email will be sent to their work address."
      : "Please verify the details below. Once confirmed, the system will generate an account and notify the user.",
  };

  // FORM INITIALIZATION
  const {
    register,
    handleSubmit,
    reset,
    watch,
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
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      mobileNum: "",
    },
  });

  // WATCH FIELDS FOR LIVE SUMMARY
  const watchedFields = watch();

  // PROGRESS CALCULATION
  const progress = useMemo(() => {
    const required = [
      "firstName",
      "middleName",
      "lastName",
      "email",
      "baranggay",
      "birthDate",
      "gender",
      "mobileNum",
    ];
    const filled = required.filter((field) => !!watchedFields[field]).length;
    return Math.floor(15 + (filled / required.length) * 85);
  }, [watchedFields]);

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
      regResult = await registerUserAccount(tempData);
      try {
        await provisionUserSystem(regResult.uid, {
          ...tempData,
          password: regResult.tempPassword,
        });
      } catch (dbError) {
        await deleteAuthUser(regResult.tempUser);
        throw new Error(`System Provisioning Failed: ${dbError.message || "Database error."}`);
      }
      await sendCredentials(tempData, regResult.tempPassword);
      showNotification(`${tempData.firstName}'s account ${config.successMsg}`, "success");
      setIsConfirmModalOpen(false);
      setTempData(null);
      reset();
      onClose();
    } catch (err) {
      const errorMsg = err.message || "An unexpected error occurred.";
      setServerError(errorMsg);
      showNotification(errorMsg, "error");
      setIsConfirmModalOpen(false);
    } finally {
      if (regResult?.tempApp) {
        try {
          await deleteApp(regResult.tempApp);
        } catch {
          /* ignore cleanup error */
        }
      }
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop>
      {/* MAIN MODAL CONTAINER (Two-Column) */}
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[32px] border border-slate-200 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-300 relative">
        {/* LEFT COLUMN: FORM SECTION */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar text-on-surface">
          <header className="mb-10 text-on-surface">
            <h3 className="text-3xl font-black tracking-tight text-slate-900">
              {config.titlePrefix} <span className="text-blue-600">{config.titleSuffix}</span>
            </h3>
            <p className="font-medium text-slate-500 mt-2 text-sm leading-relaxed text-pretty">
              {config.description}
            </p>
          </header>

          {/* ERROR DISPLAY */}
          {serverError && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-xl animate-pulse font-medium">
              <span className="font-bold uppercase tracking-wider mr-2">Provisioning Alert:</span>
              {serverError}
            </div>
          )}

          <form id="provision-form" onSubmit={handleSubmit(handlePreSubmit)} className="pb-12">
            <RegistrationFields register={register} errors={errors} currentUserRole={userRole} />
          </form>

          {/* ACTIONS */}
          <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-slate-100 bg-white sticky bottom-0">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 md:flex-none px-10 py-3.5 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              form="provision-form"
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-3.5 rounded-2xl font-bold text-sm shadow-xl shadow-blue-900/10",
                "hover:translate-y-[-2px] hover:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Processing..." : config.buttonText}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE SUMMARY CARD (Hidden on Mobile) */}
        <div className="w-full md:w-[360px] bg-slate-50 border-l border-slate-200 p-8 hidden md:flex flex-col overflow-y-auto scrollbar-none">
          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-8 shrink-0">
            Live Summary
          </h4>

          <div className="bg-white border border-slate-200/50 rounded-3xl p-6 lg:p-8 space-y-6 lg:space-y-8 flex-1 flex flex-col shadow-sm min-h-fit">
            <div className="flex flex-col items-center shrink-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold mb-4 lg:mb-6 border-4 border-white shadow-inner">
                <span
                  className="material-symbols-outlined text-[40px] lg:text-[48px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  account_circle
                </span>
              </div>
              <h5 className="text-lg font-black text-slate-900 text-center leading-tight">
                {watchedFields.firstName || watchedFields.lastName
                  ? `${watchedFields.firstName} ${watchedFields.middleName ? watchedFields.middleName + " " : ""}${watchedFields.lastName}`
                  : "New User Candidate"}
              </h5>
              <span className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mt-3">
                {watchedFields.role === ROLES.ADMIN ? "Administrator" : "Resident"}
              </span>
            </div>

            <div className="space-y-5 lg:space-y-6 flex-1">
              {[
                {
                  label: "Email Address",
                  val: watchedFields.email,
                  placeholder: "—",
                  noCaps: true,
                },
                {
                  label: "Middle Name",
                  val: watchedFields.middleName,
                  placeholder: "None provided",
                },
                {
                  label: "Gender",
                  val: watchedFields.gender
                    ? watchedFields.gender.charAt(0).toUpperCase() + watchedFields.gender.slice(1)
                    : "",
                  placeholder: "Not specified",
                },
                { label: "Birth Date", val: watchedFields.birthDate, placeholder: "—" },
                {
                  label: "Address",
                  val: watchedFields.baranggay
                    ? `${watchedFields.baranggay}, San Andres, Quezon`
                    : "..., San Andres, Quezon",
                  italic: true,
                },
              ].map((field) => (
                <div key={field.label} className="group">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {field.label}
                  </p>
                  <p
                    className={cn(
                      "text-[13px] font-semibold text-slate-700 truncate",
                      !field.noCaps && "uppercase",
                      field.italic && "italic text-slate-500 font-medium"
                    )}
                  >
                    {field.val || field.placeholder}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={14} className="text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                    Provisioning Status
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-700 ease-out rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-500 mt-3">
                  {progress === 100
                    ? "Ready for review"
                    : `Profiling: Step ${Math.min(3, Math.ceil(progress / 33.3))} of 3`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* REUSABLE CONFIRMATION MODAL */}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleFinalConfirm}
          isSubmitting={isSubmitting}
          title={config.modalTitle}
          description={config.modalDesc}
          confirmText="Confirm & Register"
        >
          <div className="max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
            <RegistrationSummary data={tempData} />
          </div>
        </ConfirmationModal>
      </div>
    </ModalBackdrop>
  );
};

export default AccountProvisioningModal;
