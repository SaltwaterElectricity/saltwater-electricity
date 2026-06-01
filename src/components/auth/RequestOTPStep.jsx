import { useState, memo } from "react";
import { Mail, Send, AlertCircle, CheckCircle2, ArrowLeft, Lock } from "lucide-react";
import { requestPasswordResetOTP } from "../../services/otp.service";

const RequestOTPStep = ({ onNext, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const getUserId = (emailStr) =>
    emailStr
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const sanitizedEmail = email.trim();
      const userId = getUserId(sanitizedEmail);

      await requestPasswordResetOTP(sanitizedEmail, userId);

      setSuccessMsg(`If an account exists for ${sanitizedEmail}, a 6-digit code has been sent.`);

      setTimeout(() => {
        onNext(sanitizedEmail);
      }, 2000);
    } catch (err) {
      setError(err.message || "The request service is currently unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full animate-in fade-in duration-500">
      {/* Branding/Shield Header */}
      <div className="mb-4 flex flex-col items-center text-center">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center relative">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden border border-slate-100">
              <img
                alt="Secure Reset Password Icon"
                className="w-full h-full object-contain p-2"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQx0QO9S80tlsOPMHh_lFrEbBthYq0CfeabIUE6rGWacxR-ghf6OnEvGMkdMpUxGSUOFbb-ezson_QkiU7RnQGztEu1i5opn7pchah1FbLitUJ1ojGzM4Ae1pQljf_8aP3MffgnJpkp1p9QE5u7x5BFB0RfSrDrB9YukggnQLJJ8i2cAxr9HI1nORhmobDatxX4-Xyvy_9KJ8xxmszaWtHW1CL0yDGE7hYOO4xusMXbKf5GiuPBSC6UUqb2AFVo2_ppjDh1RodzDjU"
              />
            </div>
          </div>
        </div>
        <h1 className="text-3xl leading-tight font-bold text-slate-900 mb-2 tracking-tight">
          Forgot <span className="text-primary">Password?</span>
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-[300px]">
          Enter your email to receive a secure reset code.
        </p>
      </div>

      {/* Error/Success States */}
      {error && (
        <div className="w-full mb-2 p-2 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="text-red-600 mt-0.5" size={18} />
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="w-full mb-2 p-2 rounded-xl bg-green-50 border border-green-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="text-green-600 mt-0.5" size={18} />
          <p className="text-sm font-medium text-green-700">{successMsg}</p>
        </div>
      )}

      {/* Recovery Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-400 px-1 tracking-widest">
            Email Address
          </label>
          <div className="relative group transition-all duration-200">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail
                className="text-slate-400 group-focus-within:text-primary transition-colors"
                size={18}
              />
            </div>
            <input
              type="email"
              required
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-slate-400 text-sm"
              placeholder="e.g. User@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || !!successMsg}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !!successMsg}
          className="w-full h-12 bg-primary text-white text-sm font-bold flex items-center justify-center gap-2.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:bg-slate-200 disabled:shadow-none disabled:transform-none disabled:text-slate-400 group"
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              <Send
                size={18}
                className="transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
              Send Reset Code
            </>
          )}
        </button>
      </form>

      {/* Navigation Links */}
      <div className="flex flex-col items-center gap-3 w-full mt-6">
        <button
          onClick={onClose}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-xl text-xs font-bold text-slate-500 hover:text-primary hover:bg-primary/5 transition-all duration-200 group uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Login
        </button>
        <div className="w-full h-px bg-slate-100 my-1" />
      </div>

      {/* Footer Compliance */}
      <div className="mt-6 flex items-center justify-center gap-2 opacity-40">
        <Lock size={14} />
        <p className="text-[11px] font-medium leading-none">Secure, encrypted recovery process.</p>
      </div>
    </div>
  );
};

const MemoizedRequestOTPStep = memo(RequestOTPStep);
export default MemoizedRequestOTPStep;
