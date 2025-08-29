import { FastifyInstance, FastifyPluginAsync } from "fastify";
import Squad from "../models/Squad";
import User from "../models/User";

const squadRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Squad routes available",
      timestamp: new Date().toISOString(),
    });
  });

  // Get all squads with pagination and filtering
  fastify.get("/", async (request, reply) => {
    try {
      const {
        page = 1,
        limit = 10,
        game,
        leader,
        isActive,
        search,
      } = request.query as any;

      const query: any = {};

      // Apply filters
      if (game && game !== "All") {
        query.game = game;
      }

      if (leader) {
        query.leader = leader;
      }

      if (isActive !== undefined) {
        query.isActive = isActive === "true";
      }

      if (search) {
        query.$text = { $search: search };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [squads, total] = await Promise.all([
        Squad.find(query)
          .populate("leader", "name email avatar")
          .populate("members", "name email avatar")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Squad.countDocuments(query),
      ]);

      return reply.status(200).send({
        success: true,
        squads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get squads error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get squads",
      });
    }
  });

  // Get squad by ID
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const squad = await Squad.findById(id)
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      return reply.status(200).send({
        success: true,
        squad,
      });
    } catch (error) {
      console.error("Get squad by ID error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get squad",
      });
    }
  });

  // Create squad
  fastify.post("/", async (request, reply) => {
    try {
      const squadData = request.body as any;

      // Validate required fields
      const requiredFields = ["name", "tag", "leader", "game", "maxMembers"];
      const missingFields = requiredFields.filter((field) => !squadData[field]);

      if (missingFields.length > 0) {
        return reply.status(400).send({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        });
      }

      // Validate maxMembers
      if (squadData.maxMembers < 5 || squadData.maxMembers > 7) {
        return reply.status(400).send({
          success: false,
          message: "Squad must have between 5 and 7 members",
        });
      }

      // Check if tag is unique
      const existingSquad = await Squad.findOne({ tag: squadData.tag });
      if (existingSquad) {
        return reply.status(400).send({
          success: false,
          message: "Squad tag already exists",
        });
      }

      // Verify leader exists
      const leader = await User.findById(squadData.leader);
      if (!leader) {
        return reply.status(400).send({
          success: false,
          message: "Leader not found",
        });
      }

      // Initialize members array with leader
      squadData.members = [squadData.leader];

      const newSquad = new Squad(squadData);
      await newSquad.save();

      const populatedSquad = await Squad.findById(newSquad._id)
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      return reply.status(201).send({
        success: true,
        message: "Squad created successfully",
        squad: populatedSquad,
      });
    } catch (error) {
      console.error("Create squad error:", error);

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
        message: "Failed to create squad",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  // Update squad (leader only)
  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;
      const { userId } = request.body as any; // Current user ID

      const squad = await Squad.findById(id);

      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      // Only leader can update squad
      if (squad.leader.toString() !== userId) {
        return reply.status(403).send({
          success: false,
          message: "Only squad leader can update squad",
        });
      }

      // Prevent updating tag if it already exists
      if (updateData.tag && updateData.tag !== squad.tag) {
        const existingSquad = await Squad.findOne({ tag: updateData.tag });
        if (existingSquad) {
          return reply.status(400).send({
            success: false,
            message: "Squad tag already exists",
          });
        }
      }

      const updatedSquad = await Squad.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      return reply.status(200).send({
        success: true,
        message: "Squad updated successfully",
        squad: updatedSquad,
      });
    } catch (error) {
      console.error("Update squad error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to update squad",
      });
    }
  });

  // Add member to squad (leader only) - DISABLED FOR NOW
  // fastify.post("/:id/members", async (request, reply) => {
  //   // TODO: Re-implement member addition functionality
  //   return reply.status(501).send({
  //     success: false,
  //     message: "Member addition functionality temporarily disabled",
  //   });
  // });

  // Remove member from squad (leader only) - DISABLED FOR NOW
  // fastify.delete("/:id/members/:memberId", async (request, reply) => {
  //   // TODO: Re-implement member removal functionality
  //   return reply.status(501).send({
  //     success: false,
  //     message: "Member removal functionality temporarily disabled",
  //   });
  // });

  // Join squad
  fastify.post("/:id/join", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.body as any;

      if (!userId) {
        return reply.status(400).send({
          success: false,
          message: "User ID is required",
        });
      }

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      if (!squad.isActive) {
        return reply.status(400).send({
          success: false,
          message: "Squad is not active",
        });
      }

      if (squad.members.length >= squad.maxMembers) {
        return reply.status(400).send({
          success: false,
          message: "Squad is full",
        });
      }

      if (squad.members.some((member) => member.toString() === userId)) {
        return reply.status(400).send({
          success: false,
          message: "User is already a member of this squad",
        });
      }

      // Add user to squad
      squad.members.push(userId);
      await squad.save();

      const populatedSquad = await Squad.findById(squad._id)
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      return reply.status(200).send({
        success: true,
        message: "Successfully joined squad",
        squad: populatedSquad,
      });
    } catch (error) {
      console.error("Join squad error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to join squad",
      });
    }
  });

  // Leave squad
  fastify.post("/:id/leave", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.body as any;

      if (!userId) {
        return reply.status(400).send({
          success: false,
          message: "User ID is required",
        });
      }

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      if (squad.leader.toString() === userId) {
        return reply.status(400).send({
          success: false,
          message: "Squad leader cannot leave the squad",
        });
      }

      if (!squad.members.some((member) => member.toString() === userId)) {
        return reply.status(400).send({
          success: false,
          message: "User is not a member of this squad",
        });
      }

      // Remove user from squad
      squad.members = squad.members.filter(
        (member) => member.toString() !== userId
      );
      await squad.save();

      const populatedSquad = await Squad.findById(squad._id)
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      return reply.status(200).send({
        success: true,
        message: "Successfully left squad",
        squad: populatedSquad,
      });
    } catch (error) {
      console.error("Leave squad error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to leave squad",
      });
    }
  });

  // Get squads by game
  fastify.get("/game/:game", async (request, reply) => {
    try {
      const { game } = request.params as { game: string };
      const { page = 1, limit = 10 } = request.query as any;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [squads, total] = await Promise.all([
        Squad.find({ game, isActive: true })
          .populate("leader", "name email avatar")
          .populate("members", "name email avatar")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Squad.countDocuments({ game, isActive: true }),
      ]);

      return reply.status(200).send({
        success: true,
        squads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get squads by game error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get squads by game",
      });
    }
  });

  // Get user's squads
  fastify.get("/user/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      const squads = await Squad.find({
        $or: [{ leader: userId }, { members: userId }],
      })
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .sort({ createdAt: -1 })
        .lean();

      return reply.status(200).send({
        success: true,
        squads,
      });
    } catch (error) {
      console.error("Get user squads error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get user squads",
      });
    }
  });
};

export default squadRoutes;
