import { Router } from "express";
import { getTutorials, getTutorialBySlug, createTutorial, updateTutorial, deleteTutorial, toggleFeatured } from "../controllers/tutorialController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";
import { uploadFile } from "../controllers/uploadController.js";

const router = Router();

router.get("/tutorials", getTutorials);
router.get("/tutorials/:slug", getTutorialBySlug);
router.get("/admin/tutorials", authenticateToken, authorizeRole("ADMIN"), getTutorials);
router.post("/admin/tutorials", authenticateToken, authorizeRole("ADMIN"), createTutorial);
router.put("/admin/tutorials/:id", authenticateToken, authorizeRole("ADMIN"), updateTutorial);
router.delete("/admin/tutorials/:id", authenticateToken, authorizeRole("ADMIN"), deleteTutorial);
router.put("/admin/tutorials/:id/featured", authenticateToken, authorizeRole("ADMIN"), toggleFeatured);
router.post("/admin/tutorials/upload", authenticateToken, authorizeRole("ADMIN"), upload.single("file"), uploadFile);

export default router;
