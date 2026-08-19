import { Router } from "express";
import {
  getQuestions,
  getResults,
  submitQuiz,
  getMyQuizHistory,
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  getAdminResults,
  createResult,
  updateResult,
  deleteResult,
} from "../controllers/skinQuizController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

// ─── Public customer routes ───────────────────────────────────────────────────
router.get("/skin-quiz", getQuestions);
router.get("/skin-quiz/results", getResults);
router.post("/skin-quiz/submit", submitQuiz);

// ─── Protected customer route (quiz history — same JWT auth as orders) ─────────
router.get("/skin-quiz/my-history", authenticateToken, getMyQuizHistory);

// ─── Admin: Question CRUD + reorder ──────────────────────────────────────────
router.get("/admin/skin-quiz", authenticateToken, authorizeRole("ADMIN"), getAdminQuestions);
router.post("/admin/skin-quiz", authenticateToken, authorizeRole("ADMIN"), createQuestion);
router.patch("/admin/skin-quiz/reorder", authenticateToken, authorizeRole("ADMIN"), reorderQuestions);
router.put("/admin/skin-quiz/:id", authenticateToken, authorizeRole("ADMIN"), updateQuestion);
router.delete("/admin/skin-quiz/:id", authenticateToken, authorizeRole("ADMIN"), deleteQuestion);

// ─── Admin: Result CRUD ───────────────────────────────────────────────────────
router.get("/admin/skin-quiz/results", authenticateToken, authorizeRole("ADMIN"), getAdminResults);
router.post("/admin/skin-quiz/results", authenticateToken, authorizeRole("ADMIN"), createResult);
router.put("/admin/skin-quiz/results/:id", authenticateToken, authorizeRole("ADMIN"), updateResult);
router.delete("/admin/skin-quiz/results/:id", authenticateToken, authorizeRole("ADMIN"), deleteResult);

export default router;
