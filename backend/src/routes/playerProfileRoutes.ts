import { FastifyInstance, FastifyPluginAsync } from "fastify";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import PlayerProfile from "../models/PlayerProfile";

const playerProfileRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  // Health check
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Player profile routes available",
      timestamp: new Date().toISOString(),
    });
  });

  // Test endpoint to verify routing
  fastify.get("/test", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Player profile routes are working",
      timestamp: new Date().toISOString(),
    });
  });

  // Create player profile
  fastify.post("/create-profile", async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return reply.status(401).send({
          success: false,
          message: "Authentication required",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (!decoded) {
        return reply.status(401).send({
          success: false,
          message: "Invalid token",
        });
      }

      const profileData = request.body as any;

      // Validate required fields
      const requiredFields = ["inGameName"];
      const missingFields = requiredFields.filter(
        (field) => !profileData[field]
      );

      if (missingFields.length > 0) {
        return reply.status(400).send({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        });
      }

      // Set default values if not provided
      profileData.category = profileData.category || "Mobile";
      profileData.game = profileData.game || "Standoff 2";
      profileData.roles = profileData.roles || ["Player"];
      profileData.rank = profileData.rank || "Unranked";
      profileData.experience = profileData.experience || "New Player";
      profileData.bio = profileData.bio || "";

      // Check if profile already exists
      const existingProfile = await PlayerProfile.findOne({
        userId: decoded.id,
      });
      if (existingProfile) {
        return reply.status(400).send({
          success: false,
          message: "Profile already exists",
        });
      }

      // Create new profile
      const newProfile = new PlayerProfile({
        userId: decoded.id,
        ...profileData,
      });

      await newProfile.save();

      // Trigger achievement check for profile creation
      try {
        const { AchievementService } = await import(
          "../services/achievementService"
        );

        await AchievementService.processAchievementTrigger({
          userId: decoded.id,
          type: "profile_update",
          data: {
            game: profileData.game,
            rank: profileData.rank,
            category: profileData.category,
          },
        });
      } catch (achievementError) {
        console.error(
          "Error processing achievement triggers:",
          achievementError
        );
        // Don't fail the profile creation if achievement processing fails
      }

      return reply.status(201).send({
        success: true,
        message: "Profile created successfully",
        profile: newProfile,
      });
    } catch (error) {
      console.error("Create profile error:", error);

      // Check if it's a Mongoose validation error
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err: any) => err.message
        );
        return reply.status(400).send({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Failed to create profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  // Get my profile
  fastify.get("/my-profile", async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace("Bearer ", "");
      console.log("[My Profile] Request received");

      if (!token) {
        console.log("[My Profile] ERROR: No token provided");
        return reply.status(401).send({
          success: false,
          message: "Authentication required",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (!decoded) {
        console.log("[My Profile] ERROR: Invalid token");
        return reply.status(401).send({
          success: false,
          message: "Invalid token",
        });
      }

      console.log(`[My Profile] Looking for profile with userId: ${decoded.id}`);

      const profile = await PlayerProfile.findOne({
        userId: decoded.id
      }).populate(
        "userId",
        "name email avatar isOnline"
      ).lean();

      if (!profile) {
        console.log(`[My Profile] Profile not found for userId: ${decoded.id}`);
        return reply.status(404).send({
          success: false,
          message: "Profile not found",
        });
      }

      console.log(`[My Profile] SUCCESS: Found profile for ${(profile as any).inGameName}`);
      return reply.status(200).send({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("[My Profile] EXCEPTION:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get profile",
        error:
          process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      });
    }
  });

  // Update profile
  fastify.put("/update-profile", async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return reply.status(401).send({
          success: false,
          message: "Authentication required",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (!decoded) {
        return reply.status(401).send({
          success: false,
          message: "Invalid token",
        });
      }

      const updateData = request.body as any;

      // If sensitive fields are updated, reset verification status
      if (updateData.inGameName || updateData.standoff2Id) {
        updateData.isIdVerified = false;
      }

      const profile = await PlayerProfile.findOneAndUpdate(
        { userId: decoded.id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!profile) {
        return reply.status(404).send({
          success: false,
          message: "Profile not found",
        });
      }

      return reply.status(200).send({
        success: true,
        message: "Profile updated successfully",
        profile,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to update profile",
      });
    }
  });

  // Check if user has profile
  fastify.get("/has-profile", async (request, reply) => {
    try {
      const token = request.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return reply.status(401).send({
          success: false,
          message: "Authentication required",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (!decoded) {
        return reply.status(401).send({
          success: false,
          message: "Invalid token",
        });
      }

      const profile = await PlayerProfile.findOne({ userId: decoded.id });

      return reply.status(200).send({
        success: true,
        hasProfile: !!profile,
      });
    } catch (error) {
      console.error("Check profile error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to check profile",
      });
    }
  });

  // Get all profiles (for browsing, public)
  fastify.get("/profiles", async (request, reply) => {
    try {
      const profiles = await PlayerProfile.find({})
        .populate("userId", "name email avatar isOnline")
        .select("-friends"); // Don't expose friends list publicly

      return reply.status(200).send({
        success: true,
        profiles,
      });
    } catch (error) {
      console.error("Get profiles error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get profiles",
      });
    }
  });

  // Get profile by unique ID (public, no auth required) - MUST BE BEFORE /profiles/:id
  fastify.get("/profiles/unique/:uniqueId", async (request, reply) => {
    try {
      const { uniqueId } = request.params as { uniqueId: string };
      console.log(`[Profile Lookup] Received uniqueId param: "${uniqueId}"`);

      if (!uniqueId) {
        console.log("[Profile Lookup] ERROR: No uniqueId provided");
        return reply.status(400).send({
          success: false,
          message: "Unique ID is required",
        });
      }

      console.log(`[Profile Lookup] Searching for profile with uniqueId: "${uniqueId}"`);
      const profile = await PlayerProfile.findOne({ uniqueId }).populate(
        "userId",
        "name email avatar isOnline"
      ).lean();

      if (!profile) {
        console.log(`[Profile Lookup] Profile not found for uniqueId: ${uniqueId}`);
        return reply.status(404).send({
          success: false,
          message: "Profile not found",
        });
      }

      console.log(`[Profile Lookup] SUCCESS: Found profile ${(profile as any).inGameName} by uniqueId`);


      return reply.status(200).send({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("Get profile by uniqueId error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  // Get profile by userId (public) - MUST BE BEFORE /profiles/:id
  fastify.get("/profiles/user/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };
      console.log(`[Profile Lookup] Received userId param: "${userId}"`);

      if (!userId) {
        console.log("[Profile Lookup] ERROR: No userId provided");
        return reply.status(400).send({
          success: false,
          message: "User ID is required",
        });
      }

      // Try to find profile by userId (ObjectId)
      let profile;
      const isValidObjectId = mongoose.Types.ObjectId.isValid(userId);
      console.log(`[Profile Lookup] Is valid ObjectId: ${isValidObjectId}`);

      if (isValidObjectId) {
        const objectId = new mongoose.Types.ObjectId(userId);
        console.log(`[Profile Lookup] Searching for profile with userId ObjectId: ${objectId}`);

        profile = await PlayerProfile.findOne({
          userId: objectId
        }).populate(
          "userId",
          "name email avatar isOnline"
        ).lean();

        console.log(`[Profile Lookup] Result from ObjectId query: ${profile ? 'FOUND' : 'NOT FOUND'}`);
        if (profile) {
          console.log(`[Profile Lookup] Found profile: ${(profile as any).inGameName} (profileId: ${(profile as any)._id})`);
        }
      }

      // If not found by ObjectId, try as string match (for edge cases)
      if (!profile) {
        console.log(`[Profile Lookup] Trying string match for userId: "${userId}"`);
        profile = await PlayerProfile.findOne({ userId }).populate(
          "userId",
          "name email avatar isOnline"
        ).lean();
        console.log(`[Profile Lookup] Result from string query: ${profile ? 'FOUND' : 'NOT FOUND'}`);
      }

      if (!profile) {
        console.log(`[Profile Lookup] FINAL RESULT: Profile not found for userId: ${userId}`);
        return reply.status(404).send({
          success: false,
          message: "Profile not found for this user ID",
        });
      }

      console.log(`[Profile Lookup] SUCCESS: Returning profile for ${(profile as any).inGameName}`);
      return reply.status(200).send({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("[Profile Lookup] EXCEPTION:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get profile",
        error:
          process.env.NODE_ENV === "development" ? (error as Error).message : undefined,
      });
    }
  });

  // Get profile by ID (MongoDB _id) - LAST because it's a catch-all
  fastify.get("/profiles/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // Try to find by uniqueId first (if it's not a MongoDB ObjectId)
      if (id && id.length !== 24) {
        const profileByUniqueId = await PlayerProfile.findOne({
          uniqueId: id,
        }).populate("userId", "name email avatar isOnline");

        if (profileByUniqueId) {
          return reply.status(200).send({
            success: true,
            profile: profileByUniqueId,
          });
        }
      }

      // Validate MongoDB ObjectId format
      if (!id || id.length !== 24) {
        return reply.status(400).send({
          success: false,
          message: "Invalid profile ID format",
        });
      }

      const profile = await PlayerProfile.findById(id).populate(
        "userId",
        "name email avatar isOnline"
      );

      if (!profile) {
        return reply.status(404).send({
          success: false,
          message: "Profile not found",
        });
      }

      return reply.status(200).send({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("Get profile by ID error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get profile",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });
};

export default playerProfileRoutes;
