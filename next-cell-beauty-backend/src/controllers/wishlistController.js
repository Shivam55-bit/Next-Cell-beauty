import { prisma } from "../config/db.js";
import { sendSuccess, sendError } from "../utils/apiResponse.js";

export const getMyWishlist = async (req, res, next) => {
  try {
    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    const products = wishlistItems
      .filter((item) => item.product && Object.keys(item.product).length > 0)
      .map((item) => item.product);

    return sendSuccess(res, "Wishlist retrieved", products);
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { product } = req.body;

    const existing = await prisma.wishlist.findFirst({
      where: { userId: req.user.id, productId }
    });

    if (existing) {
      return sendSuccess(res, "Product already in wishlist", []);
    }

    await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        productId,
        product: product || {}
      }
    });

    return sendSuccess(res, "Added to wishlist", { productId });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const existing = await prisma.wishlist.findFirst({
      where: { userId: req.user.id, productId }
    });

    if (!existing) {
      return sendError(res, "Product not found in wishlist", 404);
    }

    await prisma.wishlist.delete({ where: { _id: existing._id } });

    return sendSuccess(res, "Removed from wishlist");
  } catch (error) {
    next(error);
  }
};
