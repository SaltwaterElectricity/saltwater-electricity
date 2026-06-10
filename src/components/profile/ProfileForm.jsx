import { useState, useEffect } from "react";
import { updateUserProfile } from "../../services/user.service";
import { useNotification } from "../../context/useNotification";
import { Edit3, MapPin, X, Calendar, Mail, Phone, Camera } from "lucide-react";
import { cn } from "../../utils/cn";

export const ProfileForm = ({ profileData, currentUid, onSaveSuccess, setIsSubmitting }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  // 📦 Lokal na hawakan ng Form Data
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    birthDate: "",
    gender: "Not Specified",
    email: "",
    mobileNum: "",
    street: "",
    baranggay: "",
    municipality: "",
    province: "Quezon",
    aboutMe: "",
  });

  // 🛰️ 1. EFFECT HOOK: Sync profileData to local state
  useEffect(() => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName?.trim() || "",
        middleName: profileData.middleName?.trim() || "",
        lastName: profileData.lastName?.trim() || "",
        suffix: profileData.suffix?.trim() || "",
        birthDate: profileData.birthDate || "",
        gender: profileData.gender || "Not Specified",
        email: profileData.email?.trim() || "",
        mobileNum: profileData.mobileNum || "",
        street: profileData.address?.street || "",
        baranggay: profileData.address?.baranggay || "",
        municipality: profileData.address?.municipality || "",
        province: profileData.address?.province || "Quezon",
        aboutMe: profileData.aboutMe || "",
      });
    }
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        firstName: profileData.firstName?.trim() || "",
        middleName: profileData.middleName?.trim() || "",
        lastName: profileData.lastName?.trim() || "",
        suffix: profileData.suffix?.trim() || "",
        birthDate: profileData.birthDate || "",
        gender: profileData.gender || "Not Specified",
        email: profileData.email?.trim() || "",
        mobileNum: profileData.mobileNum || "",
        street: profileData.address?.street || "",
        baranggay: profileData.address?.baranggay || "",
        municipality: profileData.address?.municipality || "",
        province: profileData.address?.province || "Quezon",
        aboutMe: profileData.aboutMe || "",
      });
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (setIsSubmitting) setIsSubmitting(true);

    const payload = {
      firstName: String(formData.firstName || "").trim(),
      middleName: String(formData.middleName || "").trim(),
      lastName: String(formData.lastName || "").trim(),
      suffix: String(formData.suffix || "").trim(),
      birthDate: formData.birthDate,
      gender: formData.gender,
      mobileNum: String(formData.mobileNum || "").trim(),
      aboutMe: String(formData.aboutMe || "").trim(),
      address: {
        street: String(formData.street || "").trim(),
        baranggay: String(formData.baranggay || "").trim(),
        municipality: String(formData.municipality || "").trim(),
        province: String(formData.province || "Quezon").trim(),
      },
    };

    try {
      await updateUserProfile(currentUid, payload);
      showNotification("Profile updated successfully!", "success");
      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      showNotification(error.message || "Failed to update profile.", "error");
    } finally {
      setLoading(false);
      if (setIsSubmitting) setIsSubmitting(false);
    }
  };

  const fullName = `${formData.firstName} ${formData.lastName}`.trim();
  const initials = (formData.firstName?.[0] || "") + (formData.lastName?.[0] || "");

  return (
    <div className="z-20 space-y-5 animate-in fade-in duration-500">
      {/* Profile Card Header - Overlapping with Hero */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col items-center border border-white relative pb-6 mx-6">
        <div className="relative -mt-[60px] mb-4 flex flex-col items-center">
          <div className="relative">
            <div className="w-[120px] h-[120px] rounded-full border-[4px] border-white overflow-hidden bg-slate-100 flex items-center justify-center text-primary font-black text-3xl shadow-inner">
              {profileData?.photoURL ? (
                <img
                  alt={fullName}
                  className="w-full h-full object-cover"
                  src={profileData.photoURL}
                />
              ) : (
                initials.toUpperCase() || "?"
              )}
            </div>
            <button className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full border-2 border-white shadow-lg flex items-center justify-center text-primary hover:bg-slate-50 transition-all active:scale-90 z-30">
              <Camera size={14} />
            </button>
          </div>
        </div>

        <div className="text-center space-y-3 px-6">
          <div className="space-y-0.5">
            <h2 className="font-display text-xl font-bold text-[#0b1c30]">
              {fullName || "Anonymous User"}
            </h2>
            <p className="text-primary font-medium text-[13px]">{profileData?.role || "Member"}</p>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" />
              <span className="text-[12px] font-medium">
                {formData.baranggay || "Location unset"}, Philippines
              </span>
            </div>
            <div className="flex flex-col items-center gap-y-1">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-primary" />
                <span className="text-[12px] font-medium">
                  Joined:{" "}
                  {profileData?.createdAt
                    ? new Date(profileData.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "Just now"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-primary" />
                <span className="text-[12px] font-medium">{formData.email}</span>
              </div>
            </div>
          </div>
          <div className="pt-1">
            <div className="bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-100 inline-flex items-center gap-1.5">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-600 font-bold text-[9px] uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 mx-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-[#0b1c30]">
              <span className="text-black">Profile</span>{" "}
              <span className="text-primary">Information</span>
            </h3>
            <p className="text-slate-500 text-[12px] mt-0.5">
              Manage your personal account details.
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary text-primary hover:bg-primary/5 font-bold text-[12px] transition-all"
            >
              <Edit3 size={14} />
              Edit
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-[12px] transition-all"
            >
              <X size={14} />
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Names */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              isEditing={isEditing}
              required
            />
            <Field
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              isEditing={isEditing}
            />
            <Field
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              isEditing={isEditing}
              required
            />
          </div>

          {/* Row 2: Email & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Email Address"
              icon={Mail}
              value={formData.email}
              isEditing={false}
              type="email"
            />
            <Field
              label="Contact"
              name="mobileNum"
              icon={Phone}
              value={formData.mobileNum}
              onChange={handleChange}
              isEditing={isEditing}
              type="tel"
            />
          </div>

          {/* Row 3: Address 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              isEditing={isEditing}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Barangay"
                name="baranggay"
                value={formData.baranggay}
                onChange={handleChange}
                isEditing={isEditing}
              />
              <Field
                label="Municipality"
                name="municipality"
                value={formData.municipality}
                onChange={handleChange}
                isEditing={isEditing}
              />
            </div>
          </div>

          {/* Row 4: Province, BirthDate, Gender */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1">
              <label className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                Province
              </label>
              {!isEditing ? (
                <p className="w-full bg-slate-50 border-transparent rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-700">
                  {formData.province}
                </p>
              ) : (
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-[13px] appearance-none"
                >
                  <option>Quezon</option>
                  <option>Metro Manila</option>
                  <option>Cavite</option>
                </select>
              )}
            </div>
            <Field
              label="Birth Date"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleChange}
              isEditing={isEditing}
            />
            <div className="space-y-1">
              <label className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
                Gender
              </label>
              {!isEditing ? (
                <p className="w-full bg-slate-50 border-transparent rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-700">
                  {formData.gender}
                </p>
              ) : (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-[13px] appearance-none"
                >
                  <option value="Not Specified">Not Specified</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              )}
            </div>
          </div>

          {/* Row 5: About Me */}
          <div className="space-y-1">
            <label className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
              About Me
            </label>
            {!isEditing ? (
              <p className="w-full bg-slate-50 border-transparent rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-slate-700 whitespace-pre-wrap">
                {formData.aboutMe || "N/A"}
              </p>
            ) : (
              <textarea
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                rows={3}
                className="w-full bg-slate-50 border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-[13px] resize-none"
              />
            )}
          </div>

          {/* 💾 Submission Controls */}
          {isEditing && (
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white font-black py-3 px-8 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-[12px] uppercase tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, isEditing, type = "text", icon: Icon, ...props }) => (
  <div className="space-y-1.5 min-w-0">
    <label className="font-bold text-[11px] uppercase tracking-wider text-slate-400">{label}</label>
    <div className="relative">
      {Icon && (
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
        />
      )}
      {!isEditing && label !== "Email Address" ? (
        <p
          className={cn(
            "w-full bg-slate-50 border-transparent rounded-xl py-3 px-4 text-[14px] font-semibold text-slate-700 truncate",
            Icon && "pl-11"
          )}
        >
          {props.value || "—"}
        </p>
      ) : (
        <input
          type={type}
          disabled={!isEditing && label === "Email Address"}
          className={cn(
            "w-full bg-slate-50 border-slate-200 rounded-xl py-3 px-4 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-[14px] outline-none disabled:bg-slate-100/50 disabled:cursor-not-allowed",
            Icon && "pl-11"
          )}
          {...props}
        />
      )}
    </div>
  </div>
);
