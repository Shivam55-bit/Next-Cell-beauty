import { Router } from "express";
import { getBlogs, getBlogBySlug, getBlogById, createBlog, updateBlog, deleteBlog } from "../controllers/blogController.js";
import { authenticateToken, authorizeRole } from "../middlewares/auth.js";

const router = Router();

router.get("/blogs", getBlogs);
router.get("/blogs/:slug", getBlogBySlug);

router.get("/admin/blogs", authenticateToken, authorizeRole("ADMIN"), getBlogs);
router.get("/admin/blogs/:id", authenticateToken, authorizeRole("ADMIN"), getBlogById);
router.post("/admin/blogs", authenticateToken, authorizeRole("ADMIN"), createBlog);
router.put("/admin/blogs/:id", authenticateToken, authorizeRole("ADMIN"), updateBlog);
router.delete("/admin/blogs/:id", authenticateToken, authorizeRole("ADMIN"), deleteBlog);

export default router;
