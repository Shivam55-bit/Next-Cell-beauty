import { verifyAccessToken } from "../utils/token.js";
import { sendError } from "../utils/apiResponse.js";
import { prisma } from "../config/db.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return sendError(res, "Access token required. Please log in.", 401);
    }

    const decoded = verifyAccessToken(token);
    
    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.status === "DISABLED") {
      return sendError(res, "Invalid token or user account disabled.", 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    return sendError(res, "Invalid or expired access token.", 401);
  }
};

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(res, "Forbidden. Insufficient permissions.", 403);
    }
    next();
  };
};
