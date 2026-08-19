import { Router } from "express";
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from "../controllers/customerController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/admin/customers", authenticateToken, authorizeRole("ADMIN"), getCustomers);
router.get("/admin/customers/:id", authenticateToken, authorizeRole("ADMIN"), getCustomerById);
router.post("/admin/customers", authenticateToken, authorizeRole("ADMIN"), createCustomer);
router.put("/admin/customers/:id", authenticateToken, authorizeRole("ADMIN"), updateCustomer);
router.delete("/admin/customers/:id", authenticateToken, authorizeRole("ADMIN"), deleteCustomer);

export default router;
