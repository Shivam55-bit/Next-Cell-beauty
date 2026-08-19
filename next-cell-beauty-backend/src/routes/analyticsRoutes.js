import { Router } from "express";
import {
  getOverview,
  getOrdersSummary,
  getRevenueByDay,
  getTopProducts,
  getTopCategories
} from "../controllers/analyticsController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/admin/analytics/overview", authenticateToken, authorizeRole("ADMIN"), getOverview);
router.get("/admin/analytics/orders-summary", authenticateToken, authorizeRole("ADMIN"), getOrdersSummary);
router.get("/admin/analytics/revenue-by-day", authenticateToken, authorizeRole("ADMIN"), getRevenueByDay);
router.get("/admin/analytics/top-products", authenticateToken, authorizeRole("ADMIN"), getTopProducts);
router.get("/admin/analytics/top-categories", authenticateToken, authorizeRole("ADMIN"), getTopCategories);

export default router;
