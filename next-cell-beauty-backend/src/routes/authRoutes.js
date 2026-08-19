import { Router } from "express";
import { loginAdmin, refreshToken, logoutAdmin, getMe } from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/refresh", refreshToken);
router.post("/logout", logoutAdmin);
router.get("/me", authenticateToken, getMe);

export default router;
