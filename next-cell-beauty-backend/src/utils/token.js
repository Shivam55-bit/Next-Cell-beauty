import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "NEXT_CELL_BEAUTY_SUPER_SECRET_JWT_KEY_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "NEXT_CELL_BEAUTY_REFRESH_TOKEN_SECRET_KEY_2026";
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};
