import crypto from "crypto";
import { prisma } from "../config/db.js";
import { Customer } from "../models/index.js";
import { generateAccessToken } from "../utils/token.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "";
const DEFAULT_FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

const STATE_TTL_MS = 10 * 60 * 1000;
const pendingStates = new Map();

const isGoogleConfigured = () => Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

const cleanupStates = () => {
  const now = Date.now();
  for (const [state, entry] of pendingStates) {
    if (now - entry.createdAt > STATE_TTL_MS) pendingStates.delete(state);
  }
};

const getFrontendOrigin = (req) => {
  const fromQuery = req.query.redirect;
  if (typeof fromQuery === "string" && /^https?:\/\//i.test(fromQuery)) {
    return fromQuery.replace(/\/+$/, "");
  }
  return DEFAULT_FRONTEND_URL;
};

const getRedirectUri = (frontendOrigin) => {
  if (GOOGLE_CALLBACK_URL) return GOOGLE_CALLBACK_URL;
  return `${frontendOrigin}/api/auth/google/callback`;
};

export const googleAuth = async (req, res) => {
  try {
    if (!isGoogleConfigured()) {
      const missing = [
        !GOOGLE_CLIENT_ID && "GOOGLE_CLIENT_ID",
        !GOOGLE_CLIENT_SECRET && "GOOGLE_CLIENT_SECRET"
      ].filter(Boolean);
      return res.status(503).json({
        success: false,
        message: `Google sign-in is not configured. Missing environment variable${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`
      });
    }

    const frontendOrigin = getFrontendOrigin(req);
    const redirectUri = getRedirectUri(frontendOrigin);
    const state = crypto.randomBytes(24).toString("hex");

    pendingStates.set(state, { frontendOrigin, redirectUri, createdAt: Date.now() });
    cleanupStates();

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online",
      prompt: "select_account",
      state
    });

    return res.json({
      success: true,
      url: `${GOOGLE_AUTH_URL}?${params.toString()}`
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to start Google sign-in. Please try again."
    });
  }
};

const redirectToCallback = (res, origin, params) => {
  const query = new URLSearchParams(params).toString();
  return res.redirect(`${origin}/auth/callback?${query}`);
};

export const googleAuthCallback = async (req, res) => {
  try {
    const { code, state, error: googleError } = req.query;

    if (!state || !pendingStates.has(state)) {
      return redirectToCallback(res, getFrontendOrigin(req), { error: "invalid_state" });
    }

    const { frontendOrigin, redirectUri } = pendingStates.get(state);
    pendingStates.delete(state);

    if (googleError) {
      return redirectToCallback(res, frontendOrigin, { error: "access_denied" });
    }

    if (!code || !isGoogleConfigured()) {
      return redirectToCallback(res, frontendOrigin, { error: "missing_code" });
    }

    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenResponse.json();
    const googleAccessToken = tokenData.access_token;

    if (!tokenResponse.ok || !googleAccessToken) {
      return redirectToCallback(res, frontendOrigin, { error: "token_exchange" });
    }

    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${googleAccessToken}` }
    });
    const profile = await profileResponse.json();

    if (!profileResponse.ok || !profile || !profile.email) {
      return redirectToCallback(res, frontendOrigin, { error: "profile_fetch" });
    }

    if (profile.email_verified === false) {
      return redirectToCallback(res, frontendOrigin, { error: "email_unverified" });
    }

    const email = String(profile.email).toLowerCase();
    const name = profile.name || email.split("@")[0];
    const avatar = profile.picture || "";
    const googleId = profile.sub ? String(profile.sub) : undefined;

    let user = await prisma.user.findUnique({ where: { email } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          name,
          email,
          role: "CUSTOMER",
          status: "ACTIVE",
          googleId,
          provider: "google",
          avatar
        }
      });
    } else {
      if (!user.googleId && googleId) {
        await prisma.user.update({
          where: { email },
          data: {
            googleId,
            provider: "google",
            ...(avatar && !user.avatar ? { avatar } : {})
          }
        });
        user.googleId = googleId;
        user.provider = "google";
      }
    }

    // Ensure a Customer record exists for this user (so Admin Customer Management displays them)
    const userId = user.id || user._id?.toString();
    try {
      const existingCustomer = await Customer.findOne({
        $or: [{ userId }, { email }]
      });
      if (!existingCustomer) {
        await Customer.create({
          userId,
          name: user.name || name,
          email,
          phone: "",
          totalOrders: 0,
          totalSpending: 0,
          registrationDate: new Date().toISOString().split("T")[0],
          status: "ACTIVE"
        });
      } else if (!existingCustomer.userId) {
        await Customer.findByIdAndUpdate(existingCustomer._id, { userId });
      }
    } catch (syncErr) {
      console.error("[googleAuth] Failed to sync Customer record:", syncErr.message);
    }

    const accessToken = generateAccessToken({
      id: userId,
      email: user.email,
      role: user.role || "CUSTOMER"
    });

    const userPayload = {
      name: user.name || name,
      email: user.email,
      profileImage: user.avatar || avatar
    };

    return res.redirect(
      `${frontendOrigin}/auth/callback?token=${encodeURIComponent(accessToken)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`
    );
  } catch {
    return redirectToCallback(res, getFrontendOrigin(req), { error: "internal" });
  }
};
