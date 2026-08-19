import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const transformTutorial = (t) => ({
  id: t.id || t._id?.toString(),
  slug: t.slug || "",
  title: t.title,
  thumbnail: t.thumbnail || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
  description: t.description || "",
  videoUrl: t.videoUrl || "",
  category: t.category || "Skincare Routine",
  productsUsed: t.productsUsed || "",
  author: t.author || "Beauty Expert",
  status: (t.status === "DRAFT" || t.status === "Draft") ? "Draft" : "Published",
  publishedDate: t.publishedDate || "2026-08-01",
  duration: t.duration || "",
  difficulty: t.difficulty || "",
  featured: !!t.featured,
  stepByStepGuide: Array.isArray(t.stepByStepGuide) ? t.stepByStepGuide : []
});

export const getTutorials = async (req, res, next) => {
  try {
    const tutorials = await prisma.tutorial.findMany({
      orderBy: { createdAt: "desc" }
    });

    const transformed = tutorials.map(transformTutorial);
    return sendSuccess(res, "Tutorials retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const getTutorialBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const tutorial = await prisma.tutorial.findFirst({
      where: isObjectId ? { OR: [{ slug }, { _id: slug }] } : { slug }
    });

    if (!tutorial) return sendError(res, "Tutorial not found", 404);

    return sendSuccess(res, "Tutorial retrieved", transformTutorial(tutorial));
  } catch (error) {
    next(error);
  }
};

export const createTutorial = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.title) return sendError(res, "Title is required", 400);

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + `-${Date.now()}`;

    const tutorial = await prisma.tutorial.create({
      title: body.title,
      slug,
      thumbnail: body.thumbnail || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
      description: body.description || "",
      videoUrl: body.videoUrl || "",
      category: body.category || "Skincare Routine",
      productsUsed: body.productsUsed || "",
      author: body.author || "Beauty Expert",
      status: (body.status === "Draft" || body.status === "DRAFT") ? "DRAFT" : "PUBLISHED",
      publishedDate: body.publishedDate || new Date().toISOString().split("T")[0],
      duration: body.duration || "",
      difficulty: body.difficulty || "",
      featured: !!body.featured,
      stepByStepGuide: Array.isArray(body.stepByStepGuide) ? body.stepByStepGuide : []
    });

    return sendSuccess(res, "Tutorial created successfully", transformTutorial(tutorial), 201);
  } catch (error) {
    next(error);
  }
};

export const updateTutorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const tutorial = await prisma.tutorial.update({
      where: { _id: id },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.thumbnail !== undefined ? { thumbnail: body.thumbnail } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.videoUrl !== undefined ? { videoUrl: body.videoUrl } : {}),
        ...(body.category ? { category: body.category } : {}),
        ...(body.productsUsed !== undefined ? { productsUsed: body.productsUsed } : {}),
        ...(body.author ? { author: body.author } : {}),
        ...(body.publishedDate ? { publishedDate: body.publishedDate } : {}),
        ...(body.duration !== undefined ? { duration: body.duration } : {}),
        ...(body.difficulty !== undefined ? { difficulty: body.difficulty } : {}),
        ...(body.featured !== undefined ? { featured: !!body.featured } : {}),
        ...(body.stepByStepGuide !== undefined ? { stepByStepGuide: Array.isArray(body.stepByStepGuide) ? body.stepByStepGuide : [] } : {}),
        ...(body.status ? { status: (body.status === "Draft" || body.status === "DRAFT") ? "DRAFT" : "PUBLISHED" } : {})
      }
    });

    if (!tutorial) return sendError(res, "Tutorial not found", 404);

    return sendSuccess(res, "Tutorial updated successfully", transformTutorial(tutorial));
  } catch (error) {
    next(error);
  }
};

export const deleteTutorial = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.tutorial.delete({ where: { _id: id } });
    return sendSuccess(res, "Tutorial deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const toggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tutorial = await prisma.tutorial.findUnique({ where: { _id: id } });

    if (!tutorial) return sendError(res, "Tutorial not found", 404);

    const updated = await prisma.tutorial.update({
      where: { _id: id },
      data: { featured: !tutorial.featured }
    });

    return sendSuccess(res, "Featured status updated", transformTutorial(updated));
  } catch (error) {
    next(error);
  }
};
