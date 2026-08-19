import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/admin/settings", authenticateToken, authorizeRole("ADMIN"), getSettings);
router.put("/admin/settings", authenticateToken, authorizeRole("ADMIN"), updateSettings);

export default router;
