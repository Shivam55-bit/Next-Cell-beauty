import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const transformCombo = (c) => ({
  id: c.id || c._id?.toString(),
  name: c.name,
  badge: c.badge || "Save 35%",
  tag: c.tag || "Bestseller Bundle",
  originalPrice: Number(c.originalPrice || 0),
  bundlePrice: Number(c.bundlePrice || 0),
  savings: Number(c.savings || (c.originalPrice - c.bundlePrice) || 0),
  image: c.image || "",
  description: c.description || "",
  items: Array.isArray(c.items) ? c.items : (c.items ? [c.items] : []),
  order: Number(c.order || 0),
  status: (c.status === "INACTIVE" || c.status === "Inactive") ? "Inactive" : "Active",
  createdAt: c.createdAt,
  updatedAt: c.updatedAt
});

export const getComboDeals = async (req, res, next) => {
  try {
    const combos = await prisma.comboDeal.findMany({
      orderBy: { order: "asc" }
    });
    return sendSuccess(res, "Combo deals retrieved", combos.map(transformCombo));
  } catch (error) {
    next(error);
  }
};

export const getComboById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const combo = await prisma.comboDeal.findFirst({
      where: { OR: [{ _id: id }, { id }] }
    });
    if (!combo) return sendError(res, "Combo deal not found", 404);
    return sendSuccess(res, "Combo deal retrieved", transformCombo(combo));
  } catch (error) {
    next(error);
  }
};

export const createComboDeal = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.name) return sendError(res, "Combo deal name is required", 400);
    if (!body.bundlePrice) return sendError(res, "Bundle price is required", 400);

    const originalPrice = Number(body.originalPrice || body.bundlePrice);
    const bundlePrice = Number(body.bundlePrice);
    const savings = Number(body.savings !== undefined ? body.savings : (originalPrice - bundlePrice));

    const combo = await prisma.comboDeal.create({
      name: body.name,
      badge: body.badge || "Special Deal",
      tag: body.tag || "Featured Bundle",
      originalPrice,
      bundlePrice,
      savings: savings > 0 ? savings : 0,
      image: body.image || "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
      description: body.description || "",
      items: Array.isArray(body.items) ? body.items : (typeof body.items === "string" ? body.items.split("\n").filter(Boolean) : []),
      order: Number(body.order || 0),
      status: (body.status === "Inactive" || body.status === "INACTIVE") ? "INACTIVE" : "ACTIVE"
    });

    return sendSuccess(res, "Combo deal created successfully", transformCombo(combo), 201);
  } catch (error) {
    next(error);
  }
};

export const updateComboDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.tag !== undefined) updateData.tag = body.tag;
    if (body.originalPrice !== undefined) updateData.originalPrice = Number(body.originalPrice);
    if (body.bundlePrice !== undefined) updateData.bundlePrice = Number(body.bundlePrice);
    if (body.savings !== undefined) updateData.savings = Number(body.savings);
    if (body.image !== undefined) updateData.image = body.image;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.items !== undefined) {
      updateData.items = Array.isArray(body.items) ? body.items : (typeof body.items === "string" ? body.items.split("\n").filter(Boolean) : []);
    }
    if (body.order !== undefined) updateData.order = Number(body.order);
    if (body.status !== undefined) {
      updateData.status = (body.status === "Inactive" || body.status === "INACTIVE") ? "INACTIVE" : "ACTIVE";
    }

    const combo = await prisma.comboDeal.update({
      where: { _id: id },
      data: updateData
    });

    if (!combo) return sendError(res, "Combo deal not found", 404);
    return sendSuccess(res, "Combo deal updated successfully", transformCombo(combo));
  } catch (error) {
    next(error);
  }
};

export const deleteComboDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.comboDeal.delete({ where: { _id: id } });
    return sendSuccess(res, "Combo deal deleted successfully");
  } catch (error) {
    next(error);
  }
};
