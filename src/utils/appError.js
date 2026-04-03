export class appError extends Error {
  constructor(message, isOperational = true) {
    super(message);
    this.name = "AppError";
    this.isOperational = isOperational; // Nagsasabi kung ito ba ay sinasadya nating error (validation)

    // 🛡️ Tatanggalin lang ang stack trace kung nasa Production environment tayo!
    if (process.env.NODE_ENV === "production") {
      this.stack = ""; 
    } else {
      Error.captureStackTrace(this, this.constructor); // Standard stack trace for dev
    }
  }
}