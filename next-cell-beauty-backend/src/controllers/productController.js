import { prisma } from "../config/db.js";
import { sendSuccess, sendPaginated, sendError } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const normalizeProductDocument = (p) => ({
  id: p._id?.toString() || p.id,
  name: p.title,
  title: p.title,
  sku: p.sku,
  brand: p.brand?.name || "Generic",
  category: p.category?.name || "General",
  shortDescription: p.shortDescription || "",
  fullDescription: p.description || "",
  images: Array.isArray(p.images) ? p.images : [],
  price: p.price,
  salePrice: p.compareAtPrice || p.price,
  stockQuantity: p.stock,
  stock: p.stock,
  lowStockThreshold: p.lowStockThreshold,
  status: p.status === "INACTIVE" || p.status === "Inactive" ? "Inactive" : "Active",
  featured: p.featured,
  bestSeller: p.bestSeller,
  rating: p.rating,
  reviewsCount: p.reviewsCount,
  ingredients: p.ingredients || "",
  howToUse: p.howToUse || "",
  benefits: p.benefits || "",
  skinType: p.skinType || "",
  concern: p.concern || "",
  shade: p.shade || "",
  tags: p.tags || "",
  createdAt: p.createdAt ? new Date(p.createdAt).toISOString().split("T")[0] : ""
});

export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, category, brand, status, featured, bestSeller, sortBy, order } = req.query;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    if (category) where.category = { name: { equals: category, mode: "insensitive" } };
    if (brand) where.brand = { name: { equals: brand, mode: "insensitive" } };
    if (status) where.status = status;
    if (featured === "true") where.featured = true;
    if (bestSeller === "true") where.bestSeller = true;

    const sortField = sortBy || "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const [items, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy: { [sortField]: sortOrder } }),
      prisma.product.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const transformed = items.map(normalizeProductDocument);

    return sendPaginated(res, transformed, { page, limit, total, totalPages });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const whereCondition = isObjectId
      ? { OR: [{ _id: id }, { slug: id }] }
      : { slug: id };

    const p = await prisma.product.findFirst({
      where: whereCondition
    });

    if (!p) return sendError(res, "Product not found", 404);

    return sendSuccess(res, "Product retrieved", normalizeProductDocument(p));
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const body = req.body;
    const title = body.name || body.title;
    const sku = body.sku;

    if (!title || !sku || !body.price) {
      return sendError(res, "Title, SKU, and Price are required.", 400);
    }

    const existingSku = await prisma.product.findUnique({ where: { sku } });
    if (existingSku) return sendError(res, `SKU '${sku}' already exists.`, 400);

    const slug = body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + `-${Date.now()}`;

    const categoryRecord = body.category ? await prisma.category.findFirst({ where: { name: body.category } }) : null;
    const brandRecord = body.brand ? await prisma.brand.findFirst({ where: { name: body.brand } }) : null;

    const product = await prisma.product.create({
      title,
      slug,
      sku,
      price: Number(body.price),
      compareAtPrice: body.salePrice ? Number(body.salePrice) : Number(body.price),
      stock: Number(body.stockQuantity || body.stock || 10),
      lowStockThreshold: Number(body.lowStockThreshold || 5),
      shortDescription: body.shortDescription || "",
      description: body.fullDescription || body.description || "",
      categoryId: categoryRecord?.id || categoryRecord?._id?.toString(),
      brandId: brandRecord?.id || brandRecord?._id?.toString(),
      category: categoryRecord ? { name: categoryRecord.name } : {},
      brand: brandRecord ? { name: brandRecord.name } : {},
      ingredients: body.ingredients || "",
      howToUse: body.howToUse || "",
      benefits: body.benefits || "",
      skinType: body.skinType || "",
      concern: body.concern || "",
      shade: body.shade || "",
      tags: body.tags || "",
      featured: Boolean(body.featured),
      bestSeller: Boolean(body.bestSeller),
      status: body.status === "Inactive" ? "INACTIVE" : "ACTIVE",
      images: Array.isArray(body.images) && body.images.length ? body.images : ["https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80"]
    });

    return sendSuccess(res, "Product created successfully", normalizeProductDocument(product), 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await prisma.product.findUnique({ where: { _id: id } });
    if (!existing) return sendError(res, "Product not found", 404);

    const categoryRecord = body.category ? await prisma.category.findFirst({ where: { name: body.category } }) : null;
    const brandRecord = body.brand ? await prisma.brand.findFirst({ where: { name: body.brand } }) : null;

    const updated = await prisma.product.update({
      where: { _id: id },
      data: {
        title: body.name || body.title || existing.title,
        price: body.price !== undefined ? Number(body.price) : existing.price,
        compareAtPrice: body.salePrice !== undefined ? Number(body.salePrice) : existing.compareAtPrice,
        stock: body.stockQuantity !== undefined ? Number(body.stockQuantity) : body.stock !== undefined ? Number(body.stock) : existing.stock,
        shortDescription: body.shortDescription ?? existing.shortDescription,
        description: body.fullDescription ?? body.description ?? existing.description,
        categoryId: categoryRecord ? categoryRecord.id || categoryRecord._id?.toString() : existing.categoryId,
        brandId: brandRecord ? brandRecord.id || brandRecord._id?.toString() : existing.brandId,
        category: categoryRecord ? { name: categoryRecord.name } : existing.category || {},
        brand: brandRecord ? { name: brandRecord.name } : existing.brand || {},
        ingredients: body.ingredients ?? existing.ingredients,
        howToUse: body.howToUse ?? existing.howToUse,
        benefits: body.benefits ?? existing.benefits,
        skinType: body.skinType ?? existing.skinType,
        concern: body.concern ?? existing.concern,
        status: body.status ? (body.status === "Inactive" ? "INACTIVE" : "ACTIVE") : existing.status,
        images: Array.isArray(body.images) && body.images.length ? body.images : existing.images
      }
    });

    return sendSuccess(res, "Product updated successfully", normalizeProductDocument(updated));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { _id: id } });
    return sendSuccess(res, "Product deleted successfully");
  } catch (error) {
    next(error);
  }
};
