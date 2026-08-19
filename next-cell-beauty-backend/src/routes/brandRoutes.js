import { Router } from "express";
import { getBrands, createBrand, updateBrand, deleteBrand } from "../controllers/brandController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/brands", getBrands);
router.get("/admin/brands", authenticateToken, authorizeRole("ADMIN"), getBrands);
router.post("/admin/brands", authenticateToken, authorizeRole("ADMIN"), createBrand);
router.put("/admin/brands/:id", authenticateToken, authorizeRole("ADMIN"), updateBrand);
router.delete("/admin/brands/:id", authenticateToken, authorizeRole("ADMIN"), deleteBrand);

export default router;
