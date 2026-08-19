import { Router } from "express";
import { getQuestions, getResults, getAdminQuestions, createQuestion, updateQuestion, deleteQuestion, getAdminResults, createResult, updateResult, deleteResult } from "../controllers/shadeFinderController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/shade-finder/questions", getQuestions);
router.get("/shade-finder/results", getResults);
router.get("/shade-finder", getQuestions);

router.get("/admin/shade-finder/questions", authenticateToken, authorizeRole("ADMIN"), getAdminQuestions);
router.post("/admin/shade-finder/questions", authenticateToken, authorizeRole("ADMIN"), createQuestion);
router.put("/admin/shade-finder/questions/:id", authenticateToken, authorizeRole("ADMIN"), updateQuestion);
router.delete("/admin/shade-finder/questions/:id", authenticateToken, authorizeRole("ADMIN"), deleteQuestion);

router.get("/admin/shade-finder/results", authenticateToken, authorizeRole("ADMIN"), getAdminResults);
router.post("/admin/shade-finder/results", authenticateToken, authorizeRole("ADMIN"), createResult);
router.put("/admin/shade-finder/results/:id", authenticateToken, authorizeRole("ADMIN"), updateResult);
router.delete("/admin/shade-finder/results/:id", authenticateToken, authorizeRole("ADMIN"), deleteResult);

export default router;
