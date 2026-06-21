/**
 * Logger Utility
 * 
 * Provides a unified interface for logging across the application.
 * Automatically silences logs in production mode to maintain security and performance.
 */

const isProduction = import.meta.env.MODE === 'production';

export const logger = {
  log: (...args) => {
    if (!isProduction) {
      console.log(...args);
    }
  },
  error: (...args) => {
    // Errors are often kept even in production but can be sent to a service like Sentry
    console.error(...args);
  },
  warn: (...args) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (!isProduction) {
      console.info(...args);
    }
  },
  debug: (...args) => {
    if (!isProduction) {
      console.debug(...args);
    }
  }
};

export default logger;
