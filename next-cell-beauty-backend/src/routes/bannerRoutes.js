import { Router } from "express";
import { getBanners, getBannerById, createBanner, updateBanner, deleteBanner } from "../controllers/bannerController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/banners", getBanners);
router.get("/admin/banners", authenticateToken, authorizeRole("ADMIN"), getBanners);
router.get("/admin/banners/:id", authenticateToken, authorizeRole("ADMIN"), getBannerById);
router.post("/admin/banners", authenticateToken, authorizeRole("ADMIN"), createBanner);
router.put("/admin/banners/:id", authenticateToken, authorizeRole("ADMIN"), updateBanner);
router.delete("/admin/banners/:id", authenticateToken, authorizeRole("ADMIN"), deleteBanner);

export default router;
