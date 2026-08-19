import { Router } from "express";
import { getMyWishlist, addToWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticateToken, getMyWishlist);
router.post("/:productId", authenticateToken, addToWishlist);
router.delete("/:productId", authenticateToken, removeFromWishlist);

export default router;
