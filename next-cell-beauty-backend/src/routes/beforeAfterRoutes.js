import { Router } from "express";
import { getBeforeAfters, getBeforeAfterById, createBeforeAfter, updateBeforeAfter, deleteBeforeAfter } from "../controllers/beforeAfterController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

// Public Storefront Routes
router.get("/before-after", getBeforeAfters);
router.get("/before-after/:id", getBeforeAfterById);

// Admin Protected Routes
router.get("/admin/before-after", authenticateToken, authorizeRole("ADMIN"), getBeforeAfters);
router.get("/admin/before-after/:id", authenticateToken, authorizeRole("ADMIN"), getBeforeAfterById);
router.post("/admin/before-after", authenticateToken, authorizeRole("ADMIN"), createBeforeAfter);
router.put("/admin/before-after/:id", authenticateToken, authorizeRole("ADMIN"), updateBeforeAfter);
router.delete("/admin/before-after/:id", authenticateToken, authorizeRole("ADMIN"), deleteBeforeAfter);

export default router;
