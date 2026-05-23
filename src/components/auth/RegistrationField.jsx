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
    <div className="flex flex-col">
      <label className="text-[10px] font-bold uppercase text-slate-400 mb-2">{label}</label>

      <input
        type={type}
        // A11y: Ipinapaalam sa screen readers kung ang input ay may error
        aria-invalid={hasError ? "true" : "false"}
        {...register(name, validation)}
        className={cn(
          // BASE STYLES
          "p-3 border rounded-lg text-sm outline-none transition-all",

          // DEFAULT STATE
          "border-slate-200 focus:border-blue-500 bg-white",

          // ERROR STATE
          hasError && "border-red-500 bg-red-50 focus:border-red-500",

          className
        )}
        {...rest}
      />

      {hasError && (
        <span className="text-[10px] text-red-500 mt-1 font-medium italic">
          {errors[name].message}
        </span>
      )}
    </div>
  );
};

export const RegistrationFields = ({ register, errors, currentUserRole = ROLES.RESIDENT }) => {
  const isSuperAdmin = currentUserRole === ROLES.SUPER_ADMIN;

  return (
    <div className="space-y-10">
      {/* 1. PERSONAL INFORMATION SECTION */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest border-b border-blue-100 pb-2">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            register={register}
            errors={errors}
            validation={{ required: "First name is required" }}
          />
          <InputField label="Middle Name" name="middleName" register={register} errors={errors} />
          <InputField
            label="Last Name"
            name="lastName"
            register={register}
            errors={errors}
            validation={{ required: "Last name is required" }}
          />
          <InputField
            label="Suffix"
            name="suffix"
            register={register}
            errors={errors}
            placeholder="Jr."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Birth Date"
            name="birthDate"
            type="date"
            register={register}
            errors={errors}
            validation={{ required: "Birth date is required" }}
          />
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-2">Gender</label>
            <select
              aria-invalid={errors?.gender ? "true" : "false"}
              {...register("gender")}
              className={cn(
                "p-3 border rounded-lg text-sm bg-white outline-none cursor-pointer transition-all",
                errors?.gender
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 focus:border-blue-500"
              )}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <InputField
            label="Mobile Number"
            name="mobileNum"
            register={register}
            errors={errors}
            placeholder="09123456789"
            validation={{
              required: "Mobile number is required",
              pattern: { value: /^09\d{9}$/, message: "Format: 09XXXXXXXXX" },
            }}
          />
        </div>
      </section>

      {/* 2. ADDRESS SECTION */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-100 pb-2">
          Permanent Address
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Street / House No."
            name="street"
            register={register}
            errors={errors}
            placeholder="e.g. 123 Rizal St."
          />
          <InputField
            label="Baranggay"
            name="baranggay"
            register={register}
            errors={errors}
            validation={{ required: "Baranggay is required" }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Municipality"
            name="municipality"
            register={register}
            errors={errors}
            validation={{ required: "Municipality is required" }}
          />
          <InputField
            label="City / Province"
            name="cityProvince"
            register={register}
            errors={errors}
            validation={{ required: "City/Province is required" }}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Region" name="region" register={register} errors={errors} />
          <InputField label="Zip Code" name="zipCode" register={register} errors={errors} />
        </div>
      </section>

      {/* 3. ACCESS CREDENTIALS SECTION */}
      <section className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-6">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
          Access Credentials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Work Email"
            name="email"
            type="email"
            register={register}
            errors={errors}
            validation={{
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
            }}
          />

          {/* DYNAMIC ROLE FIELD: Select for Super Admin, Hidden for Admin */}
          {isSuperAdmin ? (
            <div className="flex flex-col">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-2">
                Assigned Role
              </label>
              <select
                {...register("role")}
                className="p-3 border border-slate-200 rounded-lg text-sm bg-white outline-none cursor-pointer transition-all focus:border-blue-500"
              >
                <option value={ROLES.ADMIN}>Administrator (Staff)</option>
                <option value={ROLES.RESIDENT}>Resident (User)</option>
              </select>
            </div>
          ) : (
            <input type="hidden" value={ROLES.RESIDENT} {...register("role")} />
          )}
        </div>
      </section>
    </div>
  );
};
