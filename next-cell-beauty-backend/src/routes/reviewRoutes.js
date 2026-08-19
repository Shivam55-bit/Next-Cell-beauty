import { Router } from "express";
import { createReview, getReviews, getPublicReviews, updateReviewStatus, deleteReview } from "../controllers/reviewController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.post("/reviews", createReview);
router.get("/reviews", getPublicReviews);

router.get("/admin/reviews", authenticateToken, authorizeRole("ADMIN"), getReviews);
router.put("/admin/reviews/:id/status", authenticateToken, authorizeRole("ADMIN"), updateReviewStatus);
router.put("/admin/reviews/:id", authenticateToken, authorizeRole("ADMIN"), updateReviewStatus);
router.delete("/admin/reviews/:id", authenticateToken, authorizeRole("ADMIN"), deleteReview);

export default router;
