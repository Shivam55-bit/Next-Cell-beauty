import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const transformBrand = (b) => ({
  id: b.id || b._id?.toString(),
  name: b.name,
  slug: b.slug || b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  description: b.description || "",
  logo: b.logo || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80",
  website: b.website || "",
  status: (b.status === "INACTIVE" || b.status === "Inactive") ? "Inactive" : "Active",
  productCount: b.productCount || 0
});

export const getBrands = async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: "desc" }
    });

    const transformed = brands.map(transformBrand);
    return sendSuccess(res, "Brands retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const { name, description, logo, website, status } = req.body;
    if (!name) return sendError(res, "Brand name is required", 400);

    const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const brand = await prisma.brand.create({
      name,
      slug,
      description: description || "",
      logo: logo || "",
      website: website || "",
      status: (status === "Inactive" || status === "INACTIVE") ? "INACTIVE" : "ACTIVE"
    });

    return sendSuccess(res, "Brand created successfully", transformBrand(brand), 201);
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, logo, website, status } = req.body;

    const brand = await prisma.brand.update({
      where: { _id: id },
      data: {
        ...(name ? { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(logo !== undefined ? { logo } : {}),
        ...(website !== undefined ? { website } : {}),
        ...(status ? { status: (status === "Inactive" || status === "INACTIVE") ? "INACTIVE" : "ACTIVE" } : {})
      }
    });

    if (!brand) return sendError(res, "Brand not found", 404);

    return sendSuccess(res, "Brand updated successfully", transformBrand(brand));
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.brand.delete({ where: { _id: id } });
    return sendSuccess(res, "Brand deleted successfully");
  } catch (error) {
    next(error);
  }
};
