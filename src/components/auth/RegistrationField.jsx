import { ROLES } from "../../constants/roles";
import { cn } from "../../utils/cn";

const InputField = ({
  label,
  name,
  register,
  validation,
  errors,
  type = "text",
  className,
  ...rest
}) => {
  const hasError = !!errors?.[name];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500">
        {label} {validation?.required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        {...register(name, validation)}
        className={cn(
          "w-full bg-slate-50/50 border border-slate-200/50 rounded-xl px-4 py-2.5 text-sm transition-all outline-none",
          "focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500",
          hasError && "border-red-500 bg-red-50 focus:ring-red-500/10",
          className
        )}
        {...rest}
      />

      {hasError && (
        <span className="text-[10px] text-red-500 font-medium italic">{errors[name].message}</span>
      )}
    </div>
  );
};

export const RegistrationFields = ({ register, errors, currentUserRole = ROLES.RESIDENT }) => {
  const isSuperAdmin = currentUserRole === ROLES.SUPER_ADMIN;

  return (
    <div className="space-y-12">
      {/* 1. PERSONAL INFORMATION SECTION */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="material-symbols-outlined text-blue-600 font-variation-settings-fill"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
          <h2 className="text-[13px] font-bold text-blue-600 uppercase tracking-wider">
            Personal Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="First Name"
            name="firstName"
            register={register}
            errors={errors}
            placeholder="e.g. Juan"
            validation={{ required: "First name is required" }}
          />
          <InputField
            label="Middle Name"
            name="middleName"
            register={register}
            errors={errors}
            placeholder="e.g. Santos"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Last Name"
            name="lastName"
            register={register}
            errors={errors}
            placeholder="e.g. Dela Cruz"
            validation={{ required: "Last name is required" }}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              {...register("gender")}
              className={cn(
                "w-full bg-slate-50/50 border border-slate-200/50 rounded-xl px-4 py-2.5 text-sm transition-all outline-none cursor-pointer",
                "focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500",
                errors?.gender && "border-red-500 bg-red-50"
              )}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <InputField
            label="Birth Date"
            name="birthDate"
            type="date"
            register={register}
            errors={errors}
            validation={{ required: "Birth date is required" }}
          />
        </div>
      </section>

      {/* 2. ADDRESS SECTION */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="material-symbols-outlined text-blue-600 font-variation-settings-fill"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            location_on
          </span>
          <h2 className="text-[13px] font-bold text-blue-600 uppercase tracking-wider">
            Location Details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Region"
            name="region"
            register={register}
            errors={errors}
            readOnly
            className="bg-slate-100/50 cursor-not-allowed"
          />
          <InputField
            label="City / Province"
            name="cityProvince"
            register={register}
            errors={errors}
            readOnly
            className="bg-slate-100/50 cursor-not-allowed"
          />
          <InputField
            label="Municipality"
            name="municipality"
            register={register}
            errors={errors}
            readOnly
            className="bg-slate-100/50 cursor-not-allowed"
          />
          <InputField
            label="Baranggay"
            name="baranggay"
            register={register}
            errors={errors}
            placeholder="Enter baranggay name"
            validation={{ required: "Baranggay is required" }}
          />
        </div>
      </section>

      {/* 3. ACCESS & CONTACT SECTION */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Account Sub-section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined text-blue-600 font-variation-settings-fill"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
              <h2 className="text-[13px] font-bold text-blue-600 uppercase tracking-wider">
                Account
              </h2>
            </div>
            <InputField
              label="Email Address"
              name="email"
              type="email"
              register={register}
              errors={errors}
              placeholder="juan.delacruz@example.com"
              validation={{
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
              }}
            />
            {isSuperAdmin ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-slate-500">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("role")}
                  className="w-full bg-slate-50/50 border border-slate-200/50 rounded-xl px-4 py-2.5 text-sm transition-all outline-none cursor-pointer focus:border-blue-500"
                >
                  <option value={ROLES.RESIDENT}>Resident</option>
                  <option value={ROLES.ADMIN}>Administrator</option>
                </select>
              </div>
            ) : (
              <input type="hidden" value={ROLES.RESIDENT} {...register("role")} />
            )}
          </div>

          {/* Contact Sub-section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined text-blue-600 font-variation-settings-fill"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                call
              </span>
              <h2 className="text-[13px] font-bold text-blue-600 uppercase tracking-wider">
                Contact
              </h2>
            </div>
            <InputField
              label="Mobile Number"
              name="mobileNum"
              register={register}
              errors={errors}
              placeholder="+63 9XX XXX XXXX"
              validation={{
                required: "Mobile number is required",
                pattern: { value: /^(09|\+639)\d{9}$/, message: "Invalid format" },
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
