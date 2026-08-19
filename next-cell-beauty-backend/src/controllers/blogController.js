import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const transformBlog = (b) => ({
  id: b.id || b._id?.toString(),
  title: b.title,
  slug: b.slug,
  image: b.featuredImage || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  featuredImage: b.featuredImage || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
  shortDescription: b.shortDescription || "",
  excerpt: b.shortDescription || "",
  fullContent: b.content || "",
  content: b.content || "",
  author: b.author || "Dr. Sophia Vance",
  category: b.category || "Dermatology",
  tags: b.tags || "",
  seoTitle: b.seoTitle || "",
  seoDescription: b.seoDescription || "",
  publishDate: b.publishedAt || b.publishDate || "",
  publishedAt: b.publishedAt || b.publishDate || "",
  status: (b.status === "DRAFT" || b.status === "Draft") ? "Draft" : "Published"
});

export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" }
    });

    const transformed = blogs.map(transformBlog);
    return sendSuccess(res, "Blogs retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const blog = await prisma.blog.findFirst({
      where: isObjectId ? { OR: [{ _id: id }, { slug: id }] } : { slug: id }
    });

    if (!blog) return sendError(res, "Blog article not found", 404);

    return sendSuccess(res, "Blog article retrieved", transformBlog(blog));
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const isObjectId = mongoose.Types.ObjectId.isValid(slug);
    const blog = await prisma.blog.findFirst({
      where: isObjectId ? { OR: [{ slug }, { _id: slug }] } : { slug }
    });

    if (!blog) return sendError(res, "Blog article not found", 404);

    return sendSuccess(res, "Blog article retrieved", transformBlog(blog));
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.title) return sendError(res, "Title is required", 400);

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const blog = await prisma.blog.create({
      title: body.title,
      slug,
      featuredImage: body.featuredImage || body.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
      shortDescription: body.shortDescription || "",
      content: body.fullContent || body.content || "",
      author: body.author || "Dr. Sophia Vance",
      category: body.category || "Dermatology",
      tags: body.tags || "",
      seoTitle: body.seoTitle || "",
      seoDescription: body.seoDescription || "",
      status: (body.status === "Draft" || body.status === "DRAFT") ? "DRAFT" : "PUBLISHED",
      publishedAt: body.publishDate || new Date().toISOString().split("T")[0]
    });

    return sendSuccess(res, "Blog article published", transformBlog(blog), 201);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const blog = await prisma.blog.update({
      where: { _id: id },
      data: {
        ...(body.title ? { title: body.title } : {}),
        ...(body.featuredImage || body.image ? { featuredImage: body.featuredImage || body.image } : {}),
        ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription } : {}),
        ...(body.fullContent || body.content ? { content: body.fullContent || body.content } : {}),
        ...(body.author ? { author: body.author } : {}),
        ...(body.category ? { category: body.category } : {}),
        ...(body.status ? { status: (body.status === "Draft" || body.status === "DRAFT") ? "DRAFT" : "PUBLISHED" } : {})
      }
    });

    if (!blog) return sendError(res, "Blog article not found", 404);

    return sendSuccess(res, "Blog article updated", transformBlog(blog));
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.blog.delete({ where: { _id: id } });
    return sendSuccess(res, "Blog article deleted");
  } catch (error) {
    next(error);
  }
};
