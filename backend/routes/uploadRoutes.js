import path from "path";
import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();

// Ensure the uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in the uploads/ directory
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname).toLowerCase(); // Ensure lowercase extensions
    cb(null, `${file.fieldname}-${Date.now()}${extname}`); // Unique filename
  },
});

// File filter for image uploads
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetypes = /image\/jpeg|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Route to handle single image upload
router.post("/", (req, res) => {
  const uploadSingleImage = upload.single("image");

  uploadSingleImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors
      res.status(400).send({ message: err.message });
    } else if (err) {
      res.status(400).send({ message: err.message });
    } else if (req.file) {
      res.status(200).send({
        message: "Image uploaded successfully",
        image: `/${req.file.path.replace(/\\/g, "/")}`, // Normalize file path for cross-platform compatibility
      });
    } else {
      // No file provided
      res.status(400).send({ message: "No image file provided" });
    }
  });
});

export default router;