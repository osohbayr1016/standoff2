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

        // Validate file type and specific formats
        if (!data.mimetype.startsWith("image/")) {
          console.log(`❌ Invalid file type: ${data.mimetype}`);
          return reply.status(400).send({
            success: false,
            message: "File must be an image",
          });
        }

        // Validate specific image formats
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(data.mimetype.toLowerCase())) {
          console.log(`❌ Unsupported image format: ${data.mimetype}`);
          return reply.status(400).send({
            success: false,
            message: "Unsupported image format. Please use JPG, PNG, GIF, or WebP.",
          });
        }

        // Convert to buffer first to get accurate size
        console.log(`📤 Converting to buffer for validation...`);
        const buffer = await data.toBuffer();
        const actualFileSize = buffer.length;
        
        console.log(`📊 Actual file size: ${actualFileSize} bytes (reported: ${data.file.bytesRead} bytes)`);

        // Validate file size (5MB limit) using actual buffer size
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (actualFileSize > maxSize) {
          console.log(`❌ File too large: ${actualFileSize} bytes`);
          return reply.status(400).send({
            success: false,
            message: "Image size must be less than 5MB",
          });
        }

        // Validate buffer is not empty
        if (actualFileSize === 0) {
          console.log(`❌ Empty file buffer`);
          return reply.status(400).send({
            success: false,
            message: "File appears to be empty or corrupted",
          });
        }

        console.log(`📤 Converting to base64 and uploading to Cloudinary...`);

        // Convert buffer to base64 for Cloudinary
        const base64Image = buffer.toString("base64");
        const dataURI = `data:${data.mimetype};base64,${base64Image}`;

        // Upload to Cloudinary with better error handling
        console.log(`📤 Uploading to Cloudinary (${actualFileSize} bytes)...`);
        
        try {
          // Determine optimal transformation based on file size
          const isLargeFile = actualFileSize > 2 * 1024 * 1024; // > 2MB
          
          const uploadOptions: any = {
            folder: "e-sport-disputes",
            resource_type: "image",
            timeout: 60000, // 60 seconds timeout
            chunk_size: 6000000, // 6MB chunks for large files
            eager_async: true, // Process transformations asynchronously for large files
          };

          // Add transformations only for smaller files to avoid processing issues
          if (!isLargeFile) {
            uploadOptions.transformation = [
              { width: 800, height: 600, crop: "fill", gravity: "auto" },
              { quality: "auto", fetch_format: "auto" },
            ];
          } else {
            // For large files, use simpler transformations
            uploadOptions.transformation = [
              { quality: "auto", fetch_format: "auto" },
            ];
          }

          console.log(`📤 Upload options: ${JSON.stringify(uploadOptions)}`);
          const uploadResult = await cloudinary.uploader.upload(dataURI, uploadOptions);

          console.log(`✅ Image uploaded to Cloudinary: ${uploadResult.secure_url}`);
          console.log(`📊 Upload details: ${uploadResult.width}x${uploadResult.height}, format: ${uploadResult.format}`);

          return reply.send({
            success: true,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            message: "Image uploaded successfully",
          });
        } catch (cloudinaryError) {
          console.error("❌ Cloudinary upload error:", cloudinaryError);
          
          // Try fallback upload without transformations
          console.log(`🔄 Attempting fallback upload without transformations...`);
          try {
            const fallbackResult = await cloudinary.uploader.upload(dataURI, {
              folder: "e-sport-disputes",
              resource_type: "image",
              timeout: 60000,
            });
            
            console.log(`✅ Fallback upload successful: ${fallbackResult.secure_url}`);
            return reply.send({
              success: true,
              url: fallbackResult.secure_url,
              publicId: fallbackResult.public_id,
              message: "Image uploaded successfully (fallback)",
            });
          } catch (fallbackError) {
            console.error("❌ Fallback upload also failed:", fallbackError);
            throw cloudinaryError; // Throw original error
          }
        }
      } catch (error) {
        console.error("❌ Image upload error:", error);
        
        // Provide more specific error messages
        let errorMessage = "Failed to upload image";
        if (error instanceof Error) {
          if (error.message.includes("timeout")) {
            errorMessage = "Upload timed out. Please try with a smaller image.";
          } else if (error.message.includes("Invalid image")) {
            errorMessage = "Invalid image format. Please try a different image.";
          } else if (error.message.includes("File too large")) {
            errorMessage = "Image is too large. Please compress the image.";
          } else if (error.message.includes("Network")) {
            errorMessage = "Network error. Please check your connection and try again.";
          }
        }
        
        return reply.status(500).send({
          success: false,
          message: errorMessage,
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
