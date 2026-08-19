import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const transformBeforeAfter = (b) => ({
  id: b.id || b._id?.toString(),
  title: b.title,
  category: b.category || "Skincare Transformation",
  period: b.period || "After 2 Weeks of Daily Use",
  beforeImage: b.beforeImage || "",
  afterImage: b.afterImage || "",
  beforeLabel: b.beforeLabel || "Before",
  afterLabel: b.afterLabel || "After",
  order: Number(b.order || 0),
  status: (b.status === "INACTIVE" || b.status === "Inactive") ? "Inactive" : "Active",
  createdAt: b.createdAt,
  updatedAt: b.updatedAt
});

export const getBeforeAfters = async (req, res, next) => {
  try {
    const items = await prisma.beforeAfter.findMany({
      orderBy: { order: "asc" }
    });
    return sendSuccess(res, "Before/After comparisons retrieved", items.map(transformBeforeAfter));
  } catch (error) {
    next(error);
  }
};

export const getBeforeAfterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await prisma.beforeAfter.findFirst({
      where: { OR: [{ _id: id }, { id }] }
    });
    if (!item) return sendError(res, "Before/After item not found", 404);
    return sendSuccess(res, "Before/After retrieved", transformBeforeAfter(item));
  } catch (error) {
    next(error);
  }
};

export const createBeforeAfter = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.title) return sendError(res, "Title is required", 400);
    if (!body.beforeImage || !body.afterImage) return sendError(res, "Both Before and After images are required", 400);

    const item = await prisma.beforeAfter.create({
      title: body.title,
      category: body.category || "Skincare Transformation",
      period: body.period || "After 2 Weeks of Daily Use",
      beforeImage: body.beforeImage,
      afterImage: body.afterImage,
      beforeLabel: body.beforeLabel || "Before",
      afterLabel: body.afterLabel || "After",
      order: Number(body.order || 0),
      status: (body.status === "Inactive" || body.status === "INACTIVE") ? "INACTIVE" : "ACTIVE"
    });

    return sendSuccess(res, "Before/After created successfully", transformBeforeAfter(item), 201);
  } catch (error) {
    next(error);
  }
};

export const updateBeforeAfter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.period !== undefined) updateData.period = body.period;
    if (body.beforeImage !== undefined) updateData.beforeImage = body.beforeImage;
    if (body.afterImage !== undefined) updateData.afterImage = body.afterImage;
    if (body.beforeLabel !== undefined) updateData.beforeLabel = body.beforeLabel;
    if (body.afterLabel !== undefined) updateData.afterLabel = body.afterLabel;
    if (body.order !== undefined) updateData.order = Number(body.order);
    if (body.status !== undefined) {
      updateData.status = (body.status === "Inactive" || body.status === "INACTIVE") ? "INACTIVE" : "ACTIVE";
    }

    const item = await prisma.beforeAfter.update({
      where: { _id: id },
      data: updateData
    });

    if (!item) return sendError(res, "Before/After item not found", 404);
    return sendSuccess(res, "Before/After updated successfully", transformBeforeAfter(item));
  } catch (error) {
    next(error);
  }
};

export const deleteBeforeAfter = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.beforeAfter.delete({ where: { _id: id } });
    return sendSuccess(res, "Before/After deleted successfully");
  } catch (error) {
    next(error);
  }
};
