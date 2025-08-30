import { FastifyInstance, FastifyPluginAsync } from "fastify";
import User from "../models/User";

const userRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Update user role (for admin setup - remove in production)
  fastify.put("/update-role", async (request, reply) => {
    try {
      const { email, role } = request.body as { email: string; role: string };

      if (!email || !role) {
        return reply.status(400).send({
          success: false,
          message: "Email and role are required",
        });
      }

      const validRoles = ["PLAYER", "COACH", "ORGANIZATION", "ADMIN"];
      if (!validRoles.includes(role)) {
        return reply.status(400).send({
          success: false,
          message:
            "Invalid role. Must be one of: PLAYER, COACH, ORGANIZATION, ADMIN",
        });
      }

      const user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { role },
        { new: true }
      );

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      return reply.status(200).send({
        success: true,
        message: `User role updated to ${role}`,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      return reply.status(500).send({
        success: false,
        message: "Error updating user role",
      });
    }
  });

  // Get all players (public endpoint)
  fastify.get("/players", async (request, reply) => {
    try {
      const players = await User.find({ role: "PLAYER" }).limit(50);

      const transformedPlayers = players.map((player) => ({
        id: player._id.toString(),
        name: player.name || "Unknown Player",
        avatar: player.avatar || "/default-avatar.png",
        game: "Mobile Legends: Bang Bang", // Default game
        role: "Player",
        rank: "Unranked",
        experience: "New Player",
        description: "Player looking for opportunities",
        isOnline: false,
        isLookingForTeam: true,
      }));

      return {
        success: true,
        players: transformedPlayers,
        count: transformedPlayers.length,
      };
    } catch (error) {
      console.error("Error fetching players:", error);
      reply.status(500).send({
        success: false,
        message: "Error fetching players",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  });

  // Get all organizations (public endpoint)
  fastify.get("/organizations", async (request, reply) => {
    try {
      const organizations = await User.find({ role: "ORGANIZATION" }).limit(50);

      const transformedOrganizations = organizations.map((org) => ({
        id: org._id.toString(),
        name: org.name || "Unknown Organization",
        avatar: org.avatar || "/default-avatar.png",
        games: ["Mobile Legends: Bang Bang"], // Default game
        description: `${
          org.name || "Unknown Organization"
        } is a professional esports organization.`,
        founded: 2024,
        achievements: 0,
        isVerified: false,
      }));

      return {
        success: true,
        organizations: transformedOrganizations,
        count: transformedOrganizations.length,
      };
    } catch (error) {
      console.error("Error fetching organizations:", error);
      reply.status(500).send({
        success: false,
        message: "Error fetching organizations",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  });

  // Get user profile by ID (public endpoint)
  fastify.get("/profile/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      const user = await User.findById(userId);
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "User not found",
        });
      }

      // Transform data based on role
      const profile = {
        id: user._id.toString(),
        name: user.name || "Unknown User",
        avatar: user.avatar || "/default-avatar.png",
        role: user.role,
        isVerified: false, // Default to false for now
        joinedDate: user.createdAt,
        ...(user.role === "PLAYER" && {
          game: "Mobile Legends: Bang Bang", // Default game
          playerRole: "Player",
          rank: "Unranked",
          experience: "New Player",
          description: `${
            user.name || "Player"
          } is looking for competitive opportunities.`,
        }),
        ...(user.role === "ORGANIZATION" && {
          games: ["Mobile Legends: Bang Bang"], // Default game
          founded: 2024,
          achievements: 0,
          description: `${
            user.name || "Organization"
          } is a professional esports organization.`,
        }),
      };

      return {
        success: true,
        profile,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      reply.status(500).send({
        success: false,
        message: "Error fetching user profile",
        error:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  });
};

export default userRoutes;
