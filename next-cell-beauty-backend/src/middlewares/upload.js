import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

// Ensure upload subdirectories exist
["products", "categories", "brands", "banners", "blogs", "tutorials", "users"].forEach((dir) => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = req.body?.folder || req.query?.folder || "products";
    const url = (req.originalUrl || req.baseUrl || "").toLowerCase();
    
    if (url.includes("categories")) folder = "categories";
    else if (url.includes("brands")) folder = "brands";
    else if (url.includes("banners")) folder = "banners";
    else if (url.includes("blogs")) folder = "blogs";
    else if (url.includes("tutorials")) folder = "tutorials";
    else if (url.includes("products")) folder = "products";
    else if (url.includes("user")) folder = "users";

    const targetDir = path.join(uploadDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
