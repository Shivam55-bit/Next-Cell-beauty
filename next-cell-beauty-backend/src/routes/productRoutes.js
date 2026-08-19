import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/productController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

// Public Product Routes
router.get("/products", getProducts);
router.get("/products/:id", getProductById);

// Admin Product Routes
router.get("/admin/products", authenticateToken, authorizeRole("ADMIN"), getProducts);
router.get("/admin/products/:id", authenticateToken, authorizeRole("ADMIN"), getProductById);
router.post("/admin/products", authenticateToken, authorizeRole("ADMIN"), createProduct);
router.put("/admin/products/:id", authenticateToken, authorizeRole("ADMIN"), updateProduct);
router.delete("/admin/products/:id", authenticateToken, authorizeRole("ADMIN"), deleteProduct);

export default router;
