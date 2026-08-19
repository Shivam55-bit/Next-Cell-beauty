import { Router } from "express";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, getPublicCoupons } from "../controllers/couponController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/admin/coupons", authenticateToken, authorizeRole("ADMIN"), getCoupons);
router.post("/admin/coupons", authenticateToken, authorizeRole("ADMIN"), createCoupon);
router.put("/admin/coupons/:id", authenticateToken, authorizeRole("ADMIN"), updateCoupon);
router.delete("/admin/coupons/:id", authenticateToken, authorizeRole("ADMIN"), deleteCoupon);

router.get("/coupons", getPublicCoupons);

export default router;
