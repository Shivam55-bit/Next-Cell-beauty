import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const transformCategory = (c) => ({
  id: c.id || c._id?.toString(),
  name: c.name,
  slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  description: c.description || "",
  image: c.image || "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80",
  parentCategory: c.parent?.name || c.parentCategory || "None",
  status: (c.status === "INACTIVE" || c.status === "Inactive") ? "Inactive" : "Active",
  productCount: c.productCount || 0
});

export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" }
    });

    const transformed = categories.map(transformCategory);
    return sendSuccess(res, "Categories retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, parentCategory, status } = req.body;
    if (!name) return sendError(res, "Category name is required", 400);

    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const cat = await prisma.category.create({
      name,
      slug,
      description: description || "",
      image: image || "",
      parentCategory: parentCategory || "None",
      status: (status === "Inactive" || status === "INACTIVE") ? "INACTIVE" : "ACTIVE"
    });

    return sendSuccess(res, "Category created successfully", transformCategory(cat), 201);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, parentCategory, status } = req.body;

    const cat = await prisma.category.update({
      where: { _id: id },
      data: {
        ...(name ? { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(image !== undefined ? { image } : {}),
        ...(parentCategory !== undefined ? { parentCategory } : {}),
        ...(status ? { status: (status === "Inactive" || status === "INACTIVE") ? "INACTIVE" : "ACTIVE" } : {})
      }
    });

    if (!cat) return sendError(res, "Category not found", 404);

    return sendSuccess(res, "Category updated successfully", transformCategory(cat));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { _id: id } });
    return sendSuccess(res, "Category deleted successfully");
  } catch (error) {
    next(error);
  }
};
