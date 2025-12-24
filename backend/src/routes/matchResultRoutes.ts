import { FastifyInstance, FastifyPluginAsync } from "fastify";
import multipart from "@fastify/multipart";
import cloudinary from "../config/cloudinary";
import MatchResult, { ResultStatus } from "../models/MatchResult";
import MatchLobby, { LobbyStatus } from "../models/MatchLobby";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Helper to upload to Cloudinary from buffer
const uploadToCloudinary = async (
  buffer: Buffer,
  mimetype: string,
  folder: string
): Promise<string> => {
  try {
    // Convert buffer to base64 data URI (same approach as uploadRoutes.ts)
    const base64Image = buffer.toString("base64");
    const dataURI = `data:${mimetype};base64,${base64Image}`;

    const actualFileSize = buffer.length;
    const isLargeFile = actualFileSize > 2 * 1024 * 1024; // > 2MB

    const uploadOptions: any = {
      folder,
      resource_type: "image",
      timeout: 60000, // 60 seconds timeout
      chunk_size: 6000000, // 6MB chunks for large files
      eager_async: true, // Process transformations asynchronously for large files
    };

    // Add transformations only for smaller files to avoid processing issues
    if (!isLargeFile) {
      uploadOptions.transformation = [
        { width: 1920, height: 1080, crop: "limit" },
        { quality: "auto:good" },
      ];
    } else {
      // For large files, use simpler transformations
      uploadOptions.transformation = [
        { quality: "auto", fetch_format: "auto" },
      ];
    }

    const uploadResult = await cloudinary.uploader.upload(dataURI, uploadOptions);
    return uploadResult.secure_url;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(error.message || "Failed to upload to Cloudinary");
  }
};

const matchResultRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register multipart support for this plugin scope
  await fastify.register(multipart, {
    limits: {
      fileSize: MAX_FILE_SIZE,
      files: 4,
    },
  });

  // Upload images to Cloudinary
  fastify.post(
    "/upload",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        console.log("📸 Match result upload request received");
        
        // Check if Cloudinary is configured
        if (!isCloudinaryConfigured()) {
          console.log("❌ Cloudinary not configured");
          return reply.status(503).send({
            success: false,
            message: "Image upload service is not configured. Please contact administrator.",
          });
        }

        const userId = (request as AuthenticatedRequest).user.id;
        console.log(`🔑 User authenticated: ${userId}`);

        const parts = request.parts();
        const files: Array<{ buffer: Buffer; mimetype: string }> = [];
        let lobbyId: string | undefined;

        for await (const part of parts) {
          if (part.type === "file") {
            console.log(`📁 Processing file: ${part.filename}, type: ${part.mimetype}`);
            
            // Validate file type
            if (!ALLOWED_TYPES.includes(part.mimetype)) {
              console.log(`❌ Invalid file type: ${part.mimetype}`);
              return reply.status(400).send({
                success: false,
                message: `Invalid file type: ${part.mimetype}. Only JPG, PNG, and WEBP are allowed.`,
              });
            }

            // Read file buffer
            const buffer = await part.toBuffer();
            console.log(`📊 File buffer size: ${buffer.length} bytes`);

            // Validate buffer is not empty
            if (buffer.length === 0) {
              return reply.status(400).send({
                success: false,
                message: "File appears to be empty or corrupted",
              });
            }

            // Check file size
            if (buffer.length > MAX_FILE_SIZE) {
              return reply.status(400).send({
                success: false,
                message: "File too large. Maximum size is 5MB.",
              });
            }

            files.push({ buffer, mimetype: part.mimetype });
          } else {
            // Handle form fields
            if (part.fieldname === "lobbyId") {
              lobbyId = (part as any).value;
            }
          }
        }

        if (files.length < 2) {
          return reply.status(400).send({
            success: false,
            message: "At least 2 images are required",
          });
        }

        if (files.length > 4) {
          return reply.status(400).send({
            success: false,
            message: "Maximum 4 images allowed",
          });
        }

        if (!lobbyId) {
          return reply.status(400).send({
            success: false,
            message: "Lobby ID is required",
          });
        }

        console.log(`📤 Uploading ${files.length} images to Cloudinary for lobby ${lobbyId}`);
        
        // Upload all images to Cloudinary
        const uploadPromises = files.map((file, index) => {
          console.log(`📤 Uploading image ${index + 1}/${files.length}`);
          return uploadToCloudinary(file.buffer, file.mimetype, `match-results/${lobbyId}`);
        });

        const imageUrls = await Promise.all(uploadPromises);
        console.log(`✅ Successfully uploaded ${imageUrls.length} images`);

        return reply.send({
          success: true,
          data: { imageUrls },
        });
      } catch (error: any) {
        console.error("Upload error:", error);
        console.error("Error stack:", error.stack);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to upload images",
        });
      }
    }
  );

  // Submit match result
  fastify.post(
    "/:lobbyId/submit",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const userId = (request as AuthenticatedRequest).user.id;
        const { lobbyId } = request.params as { lobbyId: string };
        const { imageUrls } = request.body as { imageUrls: string[] };

        // Validate images
        if (!imageUrls || !Array.isArray(imageUrls)) {
          return reply.status(400).send({
            success: false,
            message: "Image URLs are required",
          });
        }

        if (imageUrls.length < 2 || imageUrls.length > 4) {
          return reply.status(400).send({
            success: false,
            message: "Must have between 2 and 4 images",
          });
        }

        // Check if lobby exists
        const lobby = await MatchLobby.findById(lobbyId);
        if (!lobby) {
          return reply.status(404).send({
            success: false,
            message: "Lobby not found",
          });
        }

        // Check if user is in the lobby
        const isPlayerInLobby = lobby.players.some(
          (player: any) => player.userId.toString() === userId
        );

        if (!isPlayerInLobby) {
          return reply.status(403).send({
            success: false,
            message: "You are not a player in this lobby",
          });
        }

        // Check if result already submitted
        const existingResult = await MatchResult.findOne({ matchLobbyId: lobbyId });
        if (existingResult) {
          return reply.status(400).send({
            success: false,
            message: "Result already submitted for this match",
          });
        }

        // Create match result with explicit PENDING status
        const matchResult = await MatchResult.create({
          matchLobbyId: lobbyId,
          submittedBy: userId,
          screenshots: imageUrls,
          status: ResultStatus.PENDING, // Explicitly set status to PENDING
          submittedAt: new Date(),
        });

        console.log(`✅ Match result created with ID: ${matchResult._id}, Status: ${matchResult.status}`);

        // Update lobby status
        lobby.status = LobbyStatus.RESULT_SUBMITTED;
        await lobby.save();

        return reply.send({
          success: true,
          message: "Match result submitted successfully",
          data: {
            resultId: matchResult._id,
            status: matchResult.status,
          },
        });
      } catch (error: any) {
        console.error("Submit result error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to submit result",
        });
      }
    }
  );

  // Get result for a lobby
  fastify.get(
    "/:lobbyId",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        const { lobbyId } = request.params as { lobbyId: string };

        const result = await MatchResult.findOne({ matchLobbyId: lobbyId })
          .populate("submittedBy", "name email")
          .populate("reviewedBy", "name email")
          .lean();

        if (!result) {
          return reply.status(404).send({
            success: false,
            message: "No result found for this lobby",
          });
        }

        return reply.send({
          success: true,
          data: result,
        });
      } catch (error: any) {
        console.error("Get result error:", error);
        return reply.status(500).send({
          success: false,
          message: error.message || "Failed to get result",
        });
      }
    }
  );
};

export default matchResultRoutes;

