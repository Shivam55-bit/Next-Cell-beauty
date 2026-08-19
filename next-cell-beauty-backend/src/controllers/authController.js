import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/token.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required.", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() }
    });

    if (!user || user.role !== "ADMIN") {
      return sendError(res, "Invalid email or password.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password.", 401);
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      admin: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return sendError(res, "Refresh token required.", 400);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token }
    });

    if (!storedToken) return sendError(res, "Invalid or revoked refresh token.", 401);

    const decoded = verifyRefreshToken(token);
    const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email, role: decoded.role });

    return sendSuccess(res, "Token refreshed successfully", { accessToken: newAccessToken });
  } catch (error) {
    return sendError(res, "Invalid refresh token.", 401);
  }
};

export const logoutAdmin = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    return sendSuccess(res, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!user) return sendError(res, "User not found.", 440);

    return sendSuccess(res, "User profile retrieved", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};
