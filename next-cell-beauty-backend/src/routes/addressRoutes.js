import { Router } from "express";
import { getMyAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "../controllers/addressController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticateToken, getMyAddresses);
router.post("/", authenticateToken, createAddress);
router.put("/:id", authenticateToken, updateAddress);
router.delete("/:id", authenticateToken, deleteAddress);
router.patch("/:id/default", authenticateToken, setDefaultAddress);

export default router;
