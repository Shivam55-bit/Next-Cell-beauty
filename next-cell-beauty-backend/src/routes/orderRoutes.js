import { Router } from "express";
import { createOrder, getOrders, getOrderById, updateOrderStatus, getMyOrders, getMyOrderById, cancelMyOrder } from "../controllers/orderController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.post("/orders", createOrder);
router.get("/orders/my-orders", authenticateToken, getMyOrders);
router.get("/orders/my-orders/:orderId", authenticateToken, getMyOrderById);
router.post("/orders/my-orders/:orderId/cancel", authenticateToken, cancelMyOrder);
router.get("/orders/:id", getOrderById);

router.get("/admin/orders", authenticateToken, authorizeRole("ADMIN"), getOrders);
router.get("/admin/orders/:id", authenticateToken, authorizeRole("ADMIN"), getOrderById);
router.put("/admin/orders/:id/status", authenticateToken, authorizeRole("ADMIN"), updateOrderStatus);
router.put("/admin/orders/:id", authenticateToken, authorizeRole("ADMIN"), updateOrderStatus);

export default router;
