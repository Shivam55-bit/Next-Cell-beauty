import { Router } from "express";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "../controllers/faqController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/faqs", getFaqs);
router.get("/admin/faqs", authenticateToken, authorizeRole("ADMIN"), getFaqs);
router.post("/admin/faqs", authenticateToken, authorizeRole("ADMIN"), createFaq);
router.put("/admin/faqs/:id", authenticateToken, authorizeRole("ADMIN"), updateFaq);
router.delete("/admin/faqs/:id", authenticateToken, authorizeRole("ADMIN"), deleteFaq);

export default router;
