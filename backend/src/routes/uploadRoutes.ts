import { FastifyInstance, FastifyPluginAsync } from "fastify";
import multipart from "@fastify/multipart";
import cloudinary from "../config/cloudinary";
import { authenticateToken } from "../middleware/auth";

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

const uploadRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register multipart plugin
  try {
    await fastify.register(multipart);
    } catch (error) {
    console.error("❌ Failed to register multipart plugin:", error);
    }

  // Health check
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Upload routes available",
      timestamp: new Date().toISOString(),
    });
  });

  // Simple test endpoint
  fastify.get("/test", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Upload test endpoint working",
      timestamp: new Date().toISOString(),
    });
  });

  // Image upload endpoint
  fastify.post(
    "/image",
    {
      preHandler: authenticateToken,
    },
    async (request: any, reply) => {
      try {
        console.log(`📸 Image upload request received`);
        console.log(`🔑 User authenticated: ${request.user ? 'Yes' : 'No'}`);
        
        // Check if Cloudinary is configured
        if (!isCloudinaryConfigured()) {
          console.log(`❌ Cloudinary not configured`);
          console.log(`📊 Environment variables:`, {
            CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
            CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
            CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
          });
          return reply.status(503).send({
            success: false,
            message:
              "Image upload service is not configured. Please contact administrator.",
          });
        }

        console.log(`✅ Cloudinary is configured`);

        const data = await request.file();
        if (!data) {
          console.log(`❌ No file data received`);
          return reply.status(400).send({
            success: false,
            message: "No image file provided",
          });
        }

        console.log(`📊 File info: ${data.filename}, ${data.mimetype}, ${data.file.bytesRead} bytes`);

        // Validate file type
        if (!data.mimetype.startsWith("image/")) {
          console.log(`❌ Invalid file type: ${data.mimetype}`);
          return reply.status(400).send({
            success: false,
            message: "File must be an image",
          });
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (data.file.bytesRead > maxSize) {
          console.log(`❌ File too large: ${data.file.bytesRead} bytes`);
          return reply.status(400).send({
            success: false,
            message: "Image size must be less than 5MB",
          });
        }

        console.log(`📤 Converting to base64 and uploading to Cloudinary...`);

        // Convert buffer to base64 for Cloudinary
        const buffer = await data.toBuffer();
        const base64Image = buffer.toString("base64");
        const dataURI = `data:${data.mimetype};base64,${base64Image}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: "e-sport-disputes",
          resource_type: "image",
          transformation: [
            { width: 800, height: 600, crop: "fill" },
            { quality: "auto" },
          ],
        });

        console.log(`✅ Image uploaded to Cloudinary: ${uploadResult.secure_url}`);

        return reply.send({
          success: true,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          message: "Image uploaded successfully",
        });
      } catch (error) {
        console.error("❌ Image upload error:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to upload image",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  // Delete image endpoint
  fastify.delete(
    "/image/:publicId",
    {
      preHandler: authenticateToken,
    },
    async (request: any, reply) => {
      try {
        // Check if Cloudinary is configured
        if (!isCloudinaryConfigured()) {
          return reply.status(503).send({
            success: false,
            message:
              "Image upload service is not configured. Please contact administrator.",
          });
        }

        const { publicId } = request.params as { publicId: string };
        if (!publicId) {
          return reply.status(400).send({
            success: false,
            message: "Public ID is required",
          });
        }

        // Delete from Cloudinary
        const deleteResult = await cloudinary.uploader.destroy(publicId);

        return reply.send({
          success: true,
          message: "Image deleted successfully",
          result: deleteResult,
        });
      } catch (error) {
        console.error("❌ Image deletion error:", error);
        return reply.status(500).send({
          success: false,
          message: "Failed to delete image",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  );

  };

export default uploadRoutes;
