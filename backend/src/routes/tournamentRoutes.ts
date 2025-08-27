import { FastifyInstance, FastifyPluginAsync } from "fastify";
import Tournament from "../models/Tournament";

const tournamentRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  // Health check
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Tournament routes available",
      timestamp: new Date().toISOString(),
    });
  });

  // Get all tournaments with pagination and filtering
  fastify.get("/", async (request, reply) => {
    try {
      const {
        page = 1,
        limit = 10,
        game,
        status,
        search,
        organizer,
      } = request.query as any;

      const query: any = {};

      // Apply filters
      if (game && game !== "All") {
        query.game = game;
      }

      if (status && status !== "All") {
        query.status = status;
      }

      if (organizer) {
        query.organizer = { $regex: organizer, $options: "i" };
      }

      if (search) {
        query.$text = { $search: search };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [tournaments, total] = await Promise.all([
        Tournament.find(query)
          .sort({ startDate: 1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Tournament.countDocuments(query),
      ]);

      return reply.status(200).send({
        success: true,
        tournaments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get tournaments error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get tournaments",
      });
    }
  });

  // Get tournament by ID
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const tournament = await Tournament.findById(id).lean();

      if (!tournament) {
        return reply.status(404).send({
          success: false,
          message: "Tournament not found",
        });
      }

      return reply.status(200).send({
        success: true,
        tournament,
      });
    } catch (error) {
      console.error("Get tournament by ID error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get tournament",
      });
    }
  });

  // Create tournament (admin only)
  fastify.post("/", async (request, reply) => {
    try {
      const tournamentData = request.body as any;

      // Validate required fields
      const requiredFields = [
        "name",
        "description",
        "game",
        "startDate",
        "endDate",
        "prizePool",
        "maxParticipants",
        "location",
        "organizer",
        "registrationDeadline",
      ];
      const missingFields = requiredFields.filter(
        (field) => !tournamentData[field]
      );

      if (missingFields.length > 0) {
        return reply.status(400).send({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        });
      }

      // Validate dates
      const startDate = new Date(tournamentData.startDate);
      const endDate = new Date(tournamentData.endDate);
      const registrationDeadline = new Date(
        tournamentData.registrationDeadline
      );

      if (startDate >= endDate) {
        return reply.status(400).send({
          success: false,
          message: "End date must be after start date",
        });
      }

      if (registrationDeadline >= startDate) {
        return reply.status(400).send({
          success: false,
          message: "Registration deadline must be before start date",
        });
      }

      const newTournament = new Tournament(tournamentData);
      await newTournament.save();

      return reply.status(201).send({
        success: true,
        message: "Tournament created successfully",
        tournament: newTournament,
      });
    } catch (error) {
      console.error("Create tournament error:", error);

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
        message: "Failed to create tournament",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  // Update tournament (admin only)
  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;

      // Validate dates if provided
      if (updateData.startDate && updateData.endDate) {
        const startDate = new Date(updateData.startDate);
        const endDate = new Date(updateData.endDate);

        if (startDate >= endDate) {
          return reply.status(400).send({
            success: false,
            message: "End date must be after start date",
          });
        }
      }

      if (updateData.registrationDeadline && updateData.startDate) {
        const registrationDeadline = new Date(updateData.registrationDeadline);
        const startDate = new Date(updateData.startDate);

        if (registrationDeadline >= startDate) {
          return reply.status(400).send({
            success: false,
            message: "Registration deadline must be before start date",
          });
        }
      }

      const tournament = await Tournament.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!tournament) {
        return reply.status(404).send({
          success: false,
          message: "Tournament not found",
        });
      }

      return reply.status(200).send({
        success: true,
        message: "Tournament updated successfully",
        tournament,
      });
    } catch (error) {
      console.error("Update tournament error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to update tournament",
      });
    }
  });

  // Delete tournament (admin only)
  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const tournament = await Tournament.findByIdAndDelete(id);

      if (!tournament) {
        return reply.status(404).send({
          success: false,
          message: "Tournament not found",
        });
      }

      return reply.status(200).send({
        success: true,
        message: "Tournament deleted successfully",
      });
    } catch (error) {
      console.error("Delete tournament error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to delete tournament",
      });
    }
  });

  // Get tournament games
  fastify.get("/games/list", async (request, reply) => {
    try {
      const games = await Tournament.distinct("game");

      return reply.status(200).send({
        success: true,
        games,
      });
    } catch (error) {
      console.error("Get games error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get games",
      });
    }
  });

  // Get tournament organizers
  fastify.get("/organizers/list", async (request, reply) => {
    try {
      const organizers = await Tournament.distinct("organizer");

      return reply.status(200).send({
        success: true,
        organizers,
      });
    } catch (error) {
      console.error("Get organizers error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get organizers",
      });
    }
  });

  // Register for tournament
  fastify.post("/:id/register", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.body as { userId: string };

      const tournament = await Tournament.findById(id);

      if (!tournament) {
        return reply.status(404).send({
          success: false,
          message: "Tournament not found",
        });
      }

      if (tournament.status !== "upcoming") {
        return reply.status(400).send({
          success: false,
          message: "Tournament registration is closed",
        });
      }

      if (tournament.currentParticipants >= tournament.maxParticipants) {
        return reply.status(400).send({
          success: false,
          message: "Tournament is full",
        });
      }

      if (new Date() > tournament.registrationDeadline) {
        return reply.status(400).send({
          success: false,
          message: "Registration deadline has passed",
        });
      }

      if (tournament.participants.includes(userId)) {
        return reply.status(400).send({
          success: false,
          message: "Already registered for this tournament",
        });
      }

      tournament.participants.push(userId);
      tournament.currentParticipants += 1;
      await tournament.save();

      return reply.status(200).send({
        success: true,
        message: "Successfully registered for tournament",
        tournament,
      });
    } catch (error) {
      console.error("Register for tournament error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to register for tournament",
      });
    }
  });

  // Unregister from tournament
  fastify.post("/:id/unregister", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.body as { userId: string };

      const tournament = await Tournament.findById(id);

      if (!tournament) {
        return reply.status(404).send({
          success: false,
          message: "Tournament not found",
        });
      }

      if (!tournament.participants.includes(userId)) {
        return reply.status(400).send({
          success: false,
          message: "Not registered for this tournament",
        });
      }

      tournament.participants = tournament.participants.filter(
        (participant) => participant.toString() !== userId
      );
      tournament.currentParticipants -= 1;
      await tournament.save();

      return reply.status(200).send({
        success: true,
        message: "Successfully unregistered from tournament",
        tournament,
      });
    } catch (error) {
      console.error("Unregister from tournament error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to unregister from tournament",
      });
    }
  });
};

export default tournamentRoutes;
