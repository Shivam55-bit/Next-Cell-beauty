import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/admin/categories", authenticateToken, authorizeRole("ADMIN"), getCategories);
router.post("/admin/categories", authenticateToken, authorizeRole("ADMIN"), createCategory);
router.put("/admin/categories/:id", authenticateToken, authorizeRole("ADMIN"), updateCategory);
router.delete("/admin/categories/:id", authenticateToken, authorizeRole("ADMIN"), deleteCategory);

export default router;
