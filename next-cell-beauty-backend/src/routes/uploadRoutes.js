import { Router } from "express";
import { uploadFile } from "../controllers/uploadController.js";
import { upload } from "../middlewares/upload.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.post("/admin/upload", authenticateToken, authorizeRole("ADMIN"), upload.single("file"), uploadFile);
router.post("/admin/products/upload", authenticateToken, authorizeRole("ADMIN"), upload.array("files", 5), uploadFile);

export default router;
