/**
 * Telemetry Validator
 * Ensures that telemetry values are valid numbers to prevent NaN in UI calculations.
 */
export const validateTelemetry = (data) => {
  if (!data) return {};

  const clean = {};
  const numericFields = ["tds", "tds_ppm", "voltage", "timestamp"];

  numericFields.forEach((field) => {
    const val = data[field];
    if (val === undefined || val === null) {
      clean[field] = 0;
    } else if (typeof val === "number") {
      clean[field] = val;
    } else if (typeof val === "string" && !isNaN(parseFloat(val))) {
      clean[field] = parseFloat(val);
    } else {
      clean[field] = 0;
    }
  });

  // Preserve non-numeric fields (like maintenance flags)
  Object.keys(data).forEach((key) => {
    if (!numericFields.includes(key)) {
      clean[key] = data[key];
    }
  });

  return clean;
};
