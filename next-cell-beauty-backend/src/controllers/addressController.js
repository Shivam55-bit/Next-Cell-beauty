import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import mongoose from "mongoose";

export const getMyAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: -1, createdAt: -1 }
    });

    return sendSuccess(res, "Addresses retrieved", addresses);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const { fullName, phone, addressLine1, addressLine2, city, state, country, postalCode, addressType, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return sendError(res, "Please fill all required address fields.", 400);
    }

    const userId = req.user.id;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        fullName,
        phone,
        addressLine1,
        addressLine2: addressLine2 || "",
        city,
        state,
        country: country || "India",
        postalCode,
        addressType: addressType || "home",
        isDefault: !!isDefault
      }
    });

    return sendSuccess(res, "Address added successfully", address, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, addressLine1, addressLine2, city, state, country, postalCode, addressType, isDefault } = req.body;

    const existing = await prisma.address.findFirst({ where: { _id: id, userId: req.user.id } });
    if (!existing) return sendError(res, "Address not found", 404);

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id, isDefault: true, _id: { $ne: id } },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.address.update({
      where: { _id: id },
      data: {
        fullName: fullName ?? existing.fullName,
        phone: phone ?? existing.phone,
        addressLine1: addressLine1 ?? existing.addressLine1,
        addressLine2: addressLine2 ?? existing.addressLine2,
        city: city ?? existing.city,
        state: state ?? existing.state,
        country: country ?? existing.country,
        postalCode: postalCode ?? existing.postalCode,
        addressType: addressType ?? existing.addressType,
        isDefault: !!isDefault
      }
    });

    return sendSuccess(res, "Address updated successfully", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.address.findFirst({ where: { _id: id, userId: req.user.id } });
    if (!existing) return sendError(res, "Address not found", 404);

    await prisma.address.delete({ where: { _id: id } });

    return sendSuccess(res, "Address deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid address ID", 400);
    }

    const existing = await prisma.address.findFirst({ where: { _id: id, userId: req.user.id } });
    if (!existing) return sendError(res, "Address not found", 404);

    await prisma.address.updateMany({
      where: { userId: req.user.id, isDefault: true, _id: { $ne: id } },
      data: { isDefault: false }
    });

    const updated = await prisma.address.update({
      where: { _id: id },
      data: { isDefault: true }
    });

    return sendSuccess(res, "Default address updated", updated);
  } catch (error) {
    next(error);
  }
};
