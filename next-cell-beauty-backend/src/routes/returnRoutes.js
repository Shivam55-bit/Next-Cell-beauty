import { Router } from "express";
import { getReturns, createReturn, updateReturnStatus } from "../controllers/returnController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.post("/returns", createReturn);

router.get("/admin/returns", authenticateToken, authorizeRole("ADMIN"), getReturns);
router.post("/admin/returns", authenticateToken, authorizeRole("ADMIN"), createReturn);
router.put("/admin/returns/:id/status", authenticateToken, authorizeRole("ADMIN"), updateReturnStatus);
router.put("/admin/returns/:id", authenticateToken, authorizeRole("ADMIN"), updateReturnStatus);

export default router;
