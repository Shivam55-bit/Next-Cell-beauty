import { prisma } from "../config/db.js";
import { User, Customer, Order } from "../models/index.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

// Build a unified customer record from a User (role: CUSTOMER) and optional Customer + Order data
const buildCustomerEntry = async (userDoc) => {
  const userId = userDoc.id || userDoc._id?.toString();

  // Try to get linked Customer record for phone, registrationDate, etc.
  let customerRecord = null;
  try {
    customerRecord = await Customer.findOne({
      $or: [{ userId }, { email: userDoc.email }]
    }).lean();
  } catch { /* ignore */ }

  // Aggregate orders for this user
  let totalOrders = 0;
  let totalSpent = 0;
  try {
    const orders = await Order.find({ userId }).lean();
    totalOrders = orders.length;
    totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  } catch { /* ignore */ }

  const registrationDate =
    customerRecord?.registrationDate ||
    (userDoc.createdAt ? new Date(userDoc.createdAt).toISOString().split("T")[0] : "");

  const phone = userDoc.phone || customerRecord?.phone || "";

  const rawStatus = userDoc.status || customerRecord?.status || "ACTIVE";
  const status = (rawStatus === "DISABLED" || rawStatus === "Disabled") ? "Disabled" : "Active";

  return {
    id: customerRecord?._id?.toString() || userId,
    userId,
    name: userDoc.name || customerRecord?.name || "Customer",
    email: userDoc.email || "",
    phone,
    totalOrders,
    totalSpent,
    lastOrderDate: "",
    registrationDate,
    status,
    addresses: []
  };
};

export const getCustomers = async (req, res, next) => {
  try {
    // Fetch all users with CUSTOMER role
    const users = await User.find({ role: "CUSTOMER" }).sort({ createdAt: -1 }).lean();

    const transformed = await Promise.all(users.map(buildCustomerEntry));

    return sendSuccess(res, "Customers retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Try finding via Customer record first (admin CRUD creates Customer records)
    let user = null;

    try {
      const customerRecord = await Customer.findById(id).lean();
      if (customerRecord?.userId) {
        user = await User.findById(customerRecord.userId).lean();
      } else if (customerRecord) {
        // Customer exists but not linked to a User (manually created)
        const rawStatus = customerRecord.status || "ACTIVE";
        return sendSuccess(res, "Customer profile retrieved", {
          id: customerRecord._id?.toString(),
          userId: null,
          name: customerRecord.name || "Customer",
          email: customerRecord.email || "",
          phone: customerRecord.phone || "",
          totalOrders: customerRecord.totalOrders || 0,
          totalSpent: customerRecord.totalSpending || 0,
          registrationDate: customerRecord.registrationDate || "",
          status: (rawStatus === "DISABLED" || rawStatus === "Disabled") ? "Disabled" : "Active",
          addresses: []
        });
      }
    } catch { /* id might be a userId */ }

    // Fallback: try finding by User _id
    if (!user) {
      try {
        user = await User.findById(id).lean();
      } catch { /* ignore */ }
    }

    if (!user) return sendError(res, "Customer not found", 404);

    const entry = await buildCustomerEntry(user);
    return sendSuccess(res, "Customer profile retrieved", entry);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, status } = req.body;
    if (!email) return sendError(res, "Customer email is required", 400);

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await Customer.findOne({ email: normalizedEmail }).lean();
    if (existing) return sendError(res, "Customer with this email already exists", 409);

    const customerStatus = (status === "Disabled" || status === "DISABLED") ? "DISABLED" : "ACTIVE";

    const customer = await Customer.create({
      name: name || "Customer",
      email: normalizedEmail,
      phone: phone || "",
      totalOrders: 0,
      totalSpending: 0,
      registrationDate: new Date().toISOString().split("T")[0],
      status: customerStatus
    });

    const id = customer._id?.toString();
    return sendSuccess(res, "Customer created successfully", {
      id,
      userId: null,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
      totalOrders: 0,
      totalSpent: 0,
      registrationDate: customer.registrationDate,
      status: customerStatus === "DISABLED" ? "Disabled" : "Active",
      addresses: []
    }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = String(email).toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone;
    if (status) {
      const newStatus = (status === "Disabled" || status === "DISABLED") ? "DISABLED" : "ACTIVE";
      updateData.status = newStatus;
    }

    // Update Customer record
    let customer = null;
    try {
      customer = await Customer.findByIdAndUpdate(id, updateData, { new: true }).lean();
    } catch { /* id might be a userId */ }

    // If Customer record not found by id, try finding it by userId
    if (!customer) {
      try {
        customer = await Customer.findOneAndUpdate(
          { userId: id },
          updateData,
          { new: true }
        ).lean();
      } catch { /* ignore */ }
    }

    // Also sync status/name/phone to User record if linked
    const linkedUserId = customer?.userId;
    if (linkedUserId && Object.keys(updateData).length > 0) {
      const userUpdateData = {};
      if (updateData.name) userUpdateData.name = updateData.name;
      if (updateData.phone !== undefined) userUpdateData.phone = updateData.phone;
      if (updateData.status) userUpdateData.status = updateData.status;
      if (Object.keys(userUpdateData).length > 0) {
        await User.findByIdAndUpdate(linkedUserId, userUpdateData).catch(() => {});
      }
    }

    if (!customer) return sendError(res, "Customer not found", 404);

    const rawStatus = customer.status || "ACTIVE";
    return sendSuccess(res, "Customer updated successfully", {
      id: customer._id?.toString(),
      userId: customer.userId || null,
      name: customer.name || "Customer",
      email: customer.email || "",
      phone: customer.phone || "",
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpending || 0,
      registrationDate: customer.registrationDate || "",
      status: (rawStatus === "DISABLED" || rawStatus === "Disabled") ? "Disabled" : "Active",
      addresses: []
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    let deleted = false;
    try {
      const result = await Customer.findByIdAndDelete(id);
      if (result) deleted = true;
    } catch { /* ignore */ }

    if (!deleted) {
      try {
        const result = await Customer.findOneAndDelete({ userId: id });
        if (result) deleted = true;
      } catch { /* ignore */ }
    }

    if (!deleted) return sendError(res, "Customer not found", 404);

    return sendSuccess(res, "Customer deleted successfully");
  } catch (error) {
    next(error);
  }
};
