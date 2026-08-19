import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const transformBanner = (b) => ({
  id: b.id || b._id?.toString(),
  title: b.title,
  subtitle: b.subtitle || "",
  description: b.description || "",
  image: b.desktopImage || b.image || "",
  desktopImage: b.desktopImage || b.image || "",
  mobileImage: b.mobileImage || b.desktopImage || b.image || "",
  buttonText: b.buttonText || "Shop Collection",
  buttonUrl: b.buttonUrl || b.buttonLinkUrl || "/shop",
  position: b.position !== undefined ? Number(b.position) : 1,
  startDate: b.startDate || "",
  endDate: b.endDate || "",
  status: (b.status === "INACTIVE" || b.status === "Inactive") ? "Inactive" : "Active"
});

export const getBannerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await prisma.banner.findFirst({
      where: { OR: [{ _id: id }, { id }] }
    });

    if (!banner) return sendError(res, "Banner not found", 404);

    return sendSuccess(res, "Banner retrieved", transformBanner(banner));
  } catch (error) {
    next(error);
  }
};

export const getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { position: "asc" }
    });

    const transformed = banners.map(transformBanner);
    return sendSuccess(res, "Banners retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const createBanner = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.title) return sendError(res, "Banner title is required", 400);

    const desktopImg = body.desktopImage || body.image || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80";
    const mobileImg = body.mobileImage || desktopImg;

    const banner = await prisma.banner.create({
      title: body.title,
      subtitle: body.subtitle || "",
      description: body.description || "",
      desktopImage: desktopImg,
      mobileImage: mobileImg,
      buttonText: body.buttonText || "Shop Collection",
      buttonUrl: body.buttonUrl || body.buttonLinkUrl || "/shop",
      position: Number(body.position || 1),
      startDate: body.startDate || "2026-08-01",
      endDate: body.endDate || "2026-09-30",
      status: (body.status === "Inactive" || body.status === "INACTIVE") ? "INACTIVE" : "ACTIVE"
    });

    return sendSuccess(res, "Banner created successfully", transformBanner(banner), 201);
  } catch (error) {
    next(error);
  }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const updateData = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.desktopImage || body.image) updateData.desktopImage = body.desktopImage || body.image;
    if (body.mobileImage) updateData.mobileImage = body.mobileImage;
    if (body.buttonText !== undefined) updateData.buttonText = body.buttonText;
    if (body.buttonUrl || body.buttonLinkUrl) updateData.buttonUrl = body.buttonUrl || body.buttonLinkUrl;
    if (body.position !== undefined) updateData.position = Number(body.position);
    if (body.startDate !== undefined) updateData.startDate = body.startDate;
    if (body.endDate !== undefined) updateData.endDate = body.endDate;
    if (body.status !== undefined) {
      updateData.status = (body.status === "Inactive" || body.status === "INACTIVE") ? "INACTIVE" : "ACTIVE";
    }

    const banner = await prisma.banner.update({
      where: { _id: id },
      data: updateData
    });

    if (!banner) return sendError(res, "Banner not found", 404);

    return sendSuccess(res, "Banner updated successfully", transformBanner(banner));
  } catch (error) {
    next(error);
  }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { _id: id } });
    return sendSuccess(res, "Banner deleted successfully");
  } catch (error) {
    next(error);
  }
};
