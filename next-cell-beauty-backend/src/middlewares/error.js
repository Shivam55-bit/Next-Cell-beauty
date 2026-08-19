import { sendError } from "../utils/apiResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error occurred.";

  return sendError(res, message, statusCode);
};
