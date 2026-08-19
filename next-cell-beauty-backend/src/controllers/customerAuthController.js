import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { generateAccessToken } from "../utils/token.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

// Helper: build a safe user payload (never returns password/hash)
const buildUserPayload = (user) => ({
  id: user.id || user._id?.toString(),
  fullName: user.name,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || "",
  provider: user.provider || "email",
  phone: user.phone || "",
});

// Helper: format today as YYYY-MM-DD for registrationDate
const todayString = () => new Date().toISOString().split("T")[0];

// Helper: upsert a Customer record that mirrors the User
const syncCustomerRecord = async (user) => {
  const userId = user.id || user._id?.toString();
  try {
    const existing = await prisma.customer.findFirst({ where: { email: user.email } });
    if (existing) {
      // If Customer record already exists but not linked to userId, link it
      if (!existing.userId) {
        await prisma.customer.update({
          where: { id: existing.id || existing._id?.toString() },
          data: { userId }
        });
      }
      return existing;
    }

    // Create new Customer record
    return await prisma.customer.create({
      data: {
        userId,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        totalOrders: 0,
        totalSpending: 0,
        registrationDate: todayString(),
        status: "ACTIVE"
      }
    });
  } catch (err) {
    // Non-fatal — Customer record sync failure should not block auth flow
    console.error("[syncCustomerRecord] Failed to sync customer record:", err.message);
    return null;
  }
};

export const registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !fullName.trim()) {
      return sendError(res, "Full name is required.", 400);
    }

    if (!email || !email.trim()) {
      return sendError(res, "Email address is required.", 400);
    }

    if (!password) {
      return sendError(res, "Password is required.", 400);
    }

    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters.", 400);
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Check email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return sendError(res, "Please provide a valid email address.", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return sendError(res, "An account with this email already exists.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "CUSTOMER",
        status: "ACTIVE",
        provider: "email"
      }
    });

    // Create the corresponding Customer record so Admin Customer Management can display this user
    await syncCustomerRecord(user);

    const tokenPayload = { id: user.id || user._id?.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);

    return sendSuccess(res, "Registration successful", {
      token: accessToken,
      user: buildUserPayload(user)
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return sendError(res, "Email address is required.", 400);
    }

    if (!password) {
      return sendError(res, "Password is required.", 400);
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return sendError(res, "Invalid email or password.", 401);
    }

    if (user.role === "ADMIN") {
      return sendError(res, "Please use the admin login page.", 403);
    }

    if (user.status === "DISABLED") {
      return sendError(res, "Your account has been disabled. Please contact support.", 401);
    }

    if (!user.password) {
      // Account created via OAuth — no password set
      return sendError(res, "This account uses social sign-in. Please log in with Google.", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password.", 401);
    }

    const tokenPayload = { id: user.id || user._id?.toString(), email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);

    return sendSuccess(res, "Login successful", {
      token: accessToken,
      user: buildUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return sendError(res, "User not found.", 404);
    }

    // Fetch default address — Address model uses userId field
    const defaultAddress = await prisma.address.findFirst({
      where: { userId: req.user.id, isDefault: true }
    });

    // Also fetch phone from linked Customer record if not on User
    const customerRecord = await prisma.customer.findFirst({
      where: { userId: req.user.id }
    });

    const phone = user.phone || customerRecord?.phone || "";

    return sendSuccess(res, "Profile retrieved", {
      id: user.id || user._id?.toString(),
      fullName: user.name,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      provider: user.provider || "email",
      phone,
      address: user.address || "",
      defaultAddress: defaultAddress || null
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerProfile = async (req, res, next) => {
  try {
    const { fullName, email, phone, address, profileImage } = req.body;

    const updateData = {};
    if (fullName !== undefined && fullName !== null) updateData.name = fullName.trim();
    if (email !== undefined && email !== null) updateData.email = String(email).toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (profileImage !== undefined) updateData.avatar = profileImage;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData
    });

    // Sync name and phone to linked Customer record as well
    const syncData = {};
    if (updateData.name) syncData.name = updateData.name;
    if (updateData.phone !== undefined) syncData.phone = updateData.phone;

    if (Object.keys(syncData).length > 0) {
      await prisma.customer.update({
        where: { userId: req.user.id },
        data: syncData
      }).catch(() => {
        // Ignore if no Customer record found — non-fatal
      });
    }

    return sendSuccess(res, "Profile updated successfully", {
      id: updated.id || updated._id?.toString(),
      fullName: updated.name,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatar: updated.avatar || "",
      provider: updated.provider || "email",
      phone: updated.phone || ""
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCustomerProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, "No file uploaded.", 400);
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/users/${req.file.filename}`;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: fileUrl }
    });

    return sendSuccess(res, "Profile image uploaded successfully", {
      url: fileUrl,
      user: {
        id: updated.id || updated._id?.toString(),
        fullName: updated.name,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar || "",
      }
    }, 201);
  } catch (error) {
    next(error);
  }
};
