import { useState, useEffect } from "react";
import { updateUserProfile } from "../../services/user.service";
import { useNotification } from "../../context/useNotification";
import { Edit3, User, MapPin, X, Check } from "lucide-react";

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
    // ↩️ Ibalik sa pinakahuling snapshot galing sa parent profileData
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
      });
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (setIsSubmitting) setIsSubmitting(true);

    // I-reconstruct ang flattened structure pabalik sa nested address object
    const payload = {
      firstName: String(formData.firstName || "").trim(),
      middleName: String(formData.middleName || "").trim(),
      lastName: String(formData.lastName || "").trim(),
      suffix: String(formData.suffix || "").trim(),
      birthDate: formData.birthDate,
      gender: formData.gender,
      mobileNum: String(formData.mobileNum || "").trim(),
      address: {
        street: String(formData.street || "").trim(),
        baranggay: String(formData.baranggay || "").trim(),
        municipality: String(formData.municipality || "").trim(),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      {/* 🛠️ Profile Header with Edit Control */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <User size={16} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Account Identity
            </h3>
            <p className="text-[10px] font-bold text-slate-400">
              View or modify your personal profile
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition-all active:scale-95"
          >
            <Edit3 size={12} /> Edit Profile
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all active:scale-95"
          >
            <X size={12} /> Cancel Edit
          </button>
        )}
      </div>

      {/* 👤 Group 1: Identity Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Email Address" value={formData.email} isEditing={false} />
        <Field
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          isEditing={isEditing}
          required
        />
        <Field
          label="Last Name"
          name="lastName"
          value={formData.lastName}
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
          label="Suffix"
          name="suffix"
          value={formData.suffix}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <Field
          label="Birth Date"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <div className="flex flex-col space-y-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
            Gender
          </label>
          {!isEditing ? (
            <p className="p-3 text-xs font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-transparent truncate">
              {formData.gender}
            </p>
          ) : (
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="Not Specified">Not Specified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          )}
        </div>

        <Field
          label="Mobile Number"
          name="mobileNum"
          value={formData.mobileNum}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* 📍 Group 2: Geography & Location Settings */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-400" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Address Parameters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            isEditing={isEditing}
          />
          <Field
            label="Baranggay"
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

      {/* 💾 Submission Controls */}
      {isEditing && (
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              "Saving Changes..."
            ) : (
              <>
                <Check size={14} /> Save Profile
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};

const Field = ({ label, isEditing, type = "text", ...props }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{label}</label>
    {!isEditing ? (
      <p className="p-3 text-xs font-semibold text-slate-800 bg-slate-50/50 rounded-xl border border-transparent truncate">
        {props.value || "N/A"}
      </p>
    ) : (
      <input
        type={type}
        className="w-full p-3 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 disabled:bg-slate-100 disabled:cursor-not-allowed"
        {...props}
      />
    )}
  </div>
);
