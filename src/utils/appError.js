export class appError extends Error {
  constructor(message, isOperational = true, code = "default") {
    super(message);
    this.name = "AppError";
    this.isOperational = isOperational; 
    this.code = code;

    if (process.env.NODE_ENV === "production") {
      this.stack = ""; 
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
