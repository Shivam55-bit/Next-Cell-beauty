import { Router } from "express";
import { getPolicies, getPolicyByType, getPolicyById, updatePolicy } from "../controllers/policyController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/policies", getPolicies);
router.get("/policies/:type", getPolicyByType);
router.get("/pages", getPolicies);
router.get("/pages/:type", getPolicyByType);

router.get("/admin/policies", authenticateToken, authorizeRole("ADMIN"), getPolicies);
router.get("/admin/policies/:id", authenticateToken, authorizeRole("ADMIN"), getPolicyById);
router.put("/admin/policies/:id", authenticateToken, authorizeRole("ADMIN"), updatePolicy);

export default router;
