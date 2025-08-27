import { FastifyInstance, FastifyPluginAsync } from "fastify";
import cloudinary from "../config/cloudinary";
import { authenticateToken } from "../middleware/auth";

const uploadRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  console.log("🔧 Upload routes plugin starting...");

  // Try to register multipart plugin
  try {
    await fastify.register(import("@fastify/multipart"));
    console.log("✅ Multipart plugin registered successfully");
  } catch (error) {
    console.error("❌ Failed to register multipart plugin:", error);
    console.log("⚠️ Continuing without multipart support");
  }

  // Health check
  fastify.get("/health", async (request, reply) => {
    console.log("🔧 Health check endpoint called");
    return reply.send({
      success: true,
      message: "Upload routes available",
      timestamp: new Date().toISOString(),
    });
  });

  // Simple test endpoint
  fastify.get("/test", async (request, reply) => {
    console.log("🔧 Test endpoint called");
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
        console.log("🔧 Image upload endpoint called");

        const data = await request.file();
        if (!data) {
          return reply.status(400).send({
            success: false,
            message: "No image file provided",
          });
        }

        // Validate file type
        if (!data.mimetype.startsWith("image/")) {
          return reply.status(400).send({
            success: false,
            message: "File must be an image",
          });
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (data.file.bytesRead > maxSize) {
          return reply.status(400).send({
            success: false,
            message: "Image size must be less than 5MB",
          });
        }

        // Convert buffer to base64 for Cloudinary
        const buffer = await data.toBuffer();
        const base64Image = buffer.toString("base64");
        const dataURI = `data:${data.mimetype};base64,${base64Image}`;

        console.log("🔧 Uploading to Cloudinary...");

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: "e-sport-profiles",
          resource_type: "image",
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto" },
          ],
        });

        console.log("✅ Image uploaded successfully:", {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });

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
        const { publicId } = request.params as { publicId: string };
        console.log("🔧 Delete image endpoint called for:", publicId);

        if (!publicId) {
          return reply.status(400).send({
            success: false,
            message: "Public ID is required",
          });
        }

        // Delete from Cloudinary
        const deleteResult = await cloudinary.uploader.destroy(publicId);

        console.log("✅ Image deleted successfully:", deleteResult);

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

  console.log("🔧 Upload routes plugin loaded successfully");
};

export default uploadRoutes;
