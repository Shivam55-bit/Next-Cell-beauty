import { Router } from "express";
import { getComboDeals, getComboById, createComboDeal, updateComboDeal, deleteComboDeal } from "../controllers/comboController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

// Public Storefront Routes
router.get("/combos", getComboDeals);
router.get("/combos/:id", getComboById);

// Admin Protected Routes
router.get("/admin/combos", authenticateToken, authorizeRole("ADMIN"), getComboDeals);
router.get("/admin/combos/:id", authenticateToken, authorizeRole("ADMIN"), getComboById);
router.post("/admin/combos", authenticateToken, authorizeRole("ADMIN"), createComboDeal);
router.put("/admin/combos/:id", authenticateToken, authorizeRole("ADMIN"), updateComboDeal);
router.delete("/admin/combos/:id", authenticateToken, authorizeRole("ADMIN"), deleteComboDeal);

export default router;
