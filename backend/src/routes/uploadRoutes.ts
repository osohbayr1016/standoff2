import { Router, Request, Response } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import { authenticateToken } from "../middleware/auth";

// Extend Request interface to include file property
interface MulterRequest extends Request {
  file?: any;
}

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Upload image to Cloudinary
router.post(
  "/image",
  authenticateToken,
  upload.single("image"),
  async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      console.log("🔍 Debug - File received:", {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });

      // Convert buffer to base64
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      console.log("🔍 Debug - Uploading to Cloudinary...");

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "e-sport-profiles",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto" },
        ],
      });

      console.log("🔍 Debug - Cloudinary upload result:", {
        url: result.secure_url,
        publicId: result.public_id,
      });

      res.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  }
);

// Delete image from Cloudinary
router.delete(
  "/image/:publicId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { publicId } = req.params;

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === "ok") {
        res.json({ success: true, message: "Image deleted successfully" });
      } else {
        res.status(400).json({ message: "Failed to delete image" });
      }
    } catch (error) {
      console.error("Image deletion error:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  }
);

export default router;
