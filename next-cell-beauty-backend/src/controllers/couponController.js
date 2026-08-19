import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const transformCoupon = (c) => ({
  id: c.id || c._id?.toString(),
  code: c.code,
  discountType: c.discountType === "PERCENTAGE" || c.discountType === "Percentage" ? "Percentage" : "Fixed amount",
  discountValue: c.discountValue || 0,
  minOrderAmount: c.minOrderAmount || c.minimumOrderAmount || 0,
  maxDiscount: c.maxDiscount || c.maximumDiscount || 0,
  startDate: c.startDate || c.startsAt || "2026-08-01",
  endDate: c.endDate || c.endsAt || "2026-09-30",
  expiresAt: c.expiresAt || c.endDate || "2026-09-30",
  usageLimit: c.usageLimit || 100,
  usedCount: c.usedCount || 0,
  perUserLimit: c.perUserLimit || 1,
  applicableCategories: c.applicableCategories || "All Categories",
  applicableProducts: c.applicableProducts || "All Products",
  status: (c.status === "INACTIVE" || c.status === "Inactive") ? "Inactive" : "Active"
});

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });

    const transformed = coupons.map(transformCoupon);
    return sendSuccess(res, "Coupons retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const getPublicCoupons = async (req, res, next) => {
  try {
    const now = new Date().toISOString().split("T")[0];
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" }
    });

    const validCoupons = coupons
      .map(transformCoupon)
      .filter((coupon) => {
        if (coupon.status !== "Active") return false;
        if (coupon.startDate && coupon.startDate > now) return false;
        if (coupon.endDate && coupon.endDate < now) return false;
        return true;
      });

    return sendSuccess(res, "Active coupons retrieved", validCoupons);
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.code || !body.discountValue) {
      return sendError(res, "Coupon code and discount value are required.", 400);
    }

    const code = String(body.code).toUpperCase().trim();
    const existing = await prisma.coupon.findFirst({ where: { code } });
    if (existing) return sendError(res, `Coupon code '${code}' already exists.`, 400);

    const coupon = await prisma.coupon.create({
      code,
      discountType: body.discountType === "Fixed amount" ? "FIXED" : "PERCENTAGE",
      discountValue: Number(body.discountValue),
      minOrderAmount: Number(body.minOrderAmount || body.minimumOrderAmount || 0),
      maxDiscount: Number(body.maxDiscount || body.maximumDiscount || 0),
      startDate: body.startDate || "2026-08-01",
      endDate: body.endDate || "2026-09-30",
      usageLimit: Number(body.usageLimit || 100),
      usedCount: Number(body.usedCount || 0),
      perUserLimit: Number(body.perUserLimit || 1),
      applicableCategories: body.applicableCategories || "All Categories",
      applicableProducts: body.applicableProducts || "All Products",
      status: (body.status === "Inactive" || body.status === "INACTIVE") ? "INACTIVE" : "ACTIVE"
    });

    return sendSuccess(res, "Coupon created successfully", transformCoupon(coupon), 201);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid coupon ID", 400);
    }

    const coupon = await prisma.coupon.update({
      where: { _id: id },
      data: {
        ...(body.code ? { code: String(body.code).toUpperCase() } : {}),
        ...(body.discountType ? { discountType: body.discountType === "Fixed amount" ? "FIXED" : "PERCENTAGE" } : {}),
        ...(body.discountValue !== undefined ? { discountValue: Number(body.discountValue) } : {}),
        ...(body.minOrderAmount !== undefined ? { minOrderAmount: Number(body.minOrderAmount) } : {}),
        ...(body.maxDiscount !== undefined ? { maxDiscount: Number(body.maxDiscount) } : {}),
        ...(body.startDate !== undefined ? { startDate: body.startDate } : {}),
        ...(body.endDate !== undefined ? { endDate: body.endDate } : {}),
        ...(body.usageLimit !== undefined ? { usageLimit: Number(body.usageLimit) } : {}),
        ...(body.usedCount !== undefined ? { usedCount: Number(body.usedCount) } : {}),
        ...(body.perUserLimit !== undefined ? { perUserLimit: Number(body.perUserLimit) } : {}),
        ...(body.applicableCategories !== undefined ? { applicableCategories: body.applicableCategories } : {}),
        ...(body.applicableProducts !== undefined ? { applicableProducts: body.applicableProducts } : {}),
        ...(body.status ? { status: (body.status === "Inactive" || body.status === "INACTIVE") ? "INACTIVE" : "ACTIVE" } : {})
      }
    });

    if (!coupon) return sendError(res, "Coupon not found", 404);

    return sendSuccess(res, "Coupon updated successfully", transformCoupon(coupon));
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, "Invalid coupon ID", 400);
    }

    await prisma.coupon.delete({ where: { _id: id } });
    return sendSuccess(res, "Coupon deleted successfully");
  } catch (error) {
    next(error);
  }
};
