import { FastifyInstance, FastifyPluginAsync } from "fastify";
import multipart from "@fastify/multipart";
import cloudinary from "../config/cloudinary";
import MatchResult from "../models/MatchResult";
import MatchLobby from "../models/MatchLobby";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { Readable } from "stream";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Helper to upload to Cloudinary from stream
const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1920, height: 1080, crop: "limit" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Upload failed"));
        }
      }
    );

    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
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
        const userId = (request as AuthenticatedRequest).user.id;

        const parts = request.parts();
        const files: Buffer[] = [];
        let lobbyId: string | undefined;

        for await (const part of parts) {
          if (part.type === "file") {
            // Validate file type
            if (!ALLOWED_TYPES.includes(part.mimetype)) {
              return reply.status(400).send({
                success: false,
                message: `Invalid file type: ${part.mimetype}. Only JPG, PNG, and WEBP are allowed.`,
              });
            }

            // Read file buffer
            const buffer = await part.toBuffer();

            // Check file size
            if (buffer.length > MAX_FILE_SIZE) {
              return reply.status(400).send({
                success: false,
                message: "File too large. Maximum size is 5MB.",
              });
            }

            files.push(buffer);
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

        // Upload all images to Cloudinary
        const uploadPromises = files.map((buffer) =>
          uploadToCloudinary(buffer, `match-results/${lobbyId}`)
        );

        const imageUrls = await Promise.all(uploadPromises);

        return reply.send({
          success: true,
          data: { imageUrls },
        });
      } catch (error: any) {
        console.error("Upload error:", error);
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

        // Create match result
        const matchResult = await MatchResult.create({
          matchLobbyId: lobbyId,
          submittedBy: userId,
          screenshots: imageUrls,
          submittedAt: new Date(),
        });

        // Update lobby status
        lobby.status = "RESULT_SUBMITTED" as any;
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

