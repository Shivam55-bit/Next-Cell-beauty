import { Router } from "express";
import { registerCustomer, loginCustomer, getCustomerProfile, updateCustomerProfile, uploadCustomerProfileImage } from "../controllers/customerAuthController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/profile", authenticateToken, getCustomerProfile);
router.put("/profile", authenticateToken, updateCustomerProfile);
router.post("/upload", authenticateToken, upload.single("file"), uploadCustomerProfileImage);

export default router;
