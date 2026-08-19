import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

const transformReview = (r) => ({
  id: r.id || r._id?.toString(),
  customerName: r.customerName || "Anonymous",
  productName: r.productName || "Product",
  rating: r.rating || 5,
  comment: r.comment || "",
  image: r.image || "",
  date: r.date || "2026-08-07",
  status: r.status === "APPROVED" || r.status === "Approved" ? "Approved" : r.status === "REJECTED" || r.status === "Rejected" ? "Rejected" : "Pending"
});

export const createReview = async (req, res, next) => {
  try {
    const { customerName, productName, productId, rating, comment, image } = req.body;
    if (!customerName || !productName || !rating || !comment) {
      return sendError(res, "Missing required review fields.", 400);
    }

    const review = await prisma.review.create({
      customerName,
      productName,
      productId: productId || "",
      rating: Number(rating),
      comment,
      image: image || "",
      date: new Date().toISOString().split("T")[0],
      status: "Pending"
    });

    return sendSuccess(res, "Review submitted for moderation.", transformReview(review), 201);
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" }
    });

    const transformed = reviews.map(transformReview);
    return sendSuccess(res, "Reviews retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const getPublicReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { OR: [{ status: "Approved" }, { status: "APPROVED" }] },
      orderBy: { createdAt: "desc" }
    });

    const transformed = reviews.map(transformReview);
    return sendSuccess(res, "Reviews retrieved", transformed);
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const review = await prisma.review.update({
      where: { _id: id },
      data: {
        status: status ? (status === "Approved" || status === "APPROVED" ? "Approved" : status === "Rejected" || status === "REJECTED" ? "Rejected" : "Pending") : "Pending"
      }
    });

    if (!review) return sendError(res, "Review not found", 404);

    return sendSuccess(res, "Review status updated", transformReview(review));
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.review.delete({ where: { _id: id } });
    return sendSuccess(res, "Review deleted successfully");
  } catch (error) {
    next(error);
  }
};
