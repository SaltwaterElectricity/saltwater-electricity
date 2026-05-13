export class appError extends Error {
<<<<<<< HEAD
  constructor(message, isOperational = true, code = "default") {
    super(message);
    this.name = "AppError";
    this.isOperational = isOperational; 
    this.code = code;

    if (import.meta.env.MODE === "production") {
      this.stack = ""; 
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
=======
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
>>>>>>> c81ec3273035eaedf93d36882c4b5ed75935f31a
