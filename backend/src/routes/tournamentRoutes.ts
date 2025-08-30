import { FastifyInstance, FastifyPluginAsync } from "fastify";
import Tournament from "../models/Tournament";
import TournamentRegistration from "../models/TournamentRegistration";

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

  // Get tournament registrations (for tournament detail page)
  fastify.get("/:id/registrations", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { page = 1, limit = 10 } = request.query as any;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [registrations, total] = await Promise.all([
        TournamentRegistration.find({ tournament: id })
          .populate("squad", "name tag logo")
          .populate("squadLeader", "name email avatar")
          .populate("squadMembers", "name email avatar")
          .sort({ registrationDate: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        TournamentRegistration.countDocuments({ tournament: id }),
      ]);

      return reply.status(200).send({
        success: true,
        registrations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get tournament registrations error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get tournament registrations",
      });
    }
  });

  // Register squad for tournament
  fastify.post("/:id/register", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { squadId, entryFee, currency } = request.body as any;

      // Check if tournament exists
      const tournament = await Tournament.findById(id);
      if (!tournament) {
        return reply.status(404).send({
          success: false,
          message: "Tournament not found",
        });
      }

      // Check if tournament is full
      if (tournament.currentSquads >= tournament.maxSquads) {
        return reply.status(400).send({
          success: false,
          message: "Tournament is full",
        });
      }

      // Check if squad is already registered
      const existingRegistration = await TournamentRegistration.findOne({
        tournament: id,
        squad: squadId,
      });

      if (existingRegistration) {
        return reply.status(400).send({
          success: false,
          message: "Squad is already registered for this tournament",
        });
      }

      // Get squad details to populate leader and members
      const Squad = (await import("../models/Squad")).default;
      const squad = await Squad.findById(squadId);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      // Create tournament registration
      const registration = new TournamentRegistration({
        tournament: id,
        squad: squadId,
        squadLeader: squad.leader,
        squadMembers: squad.members,
        registrationFee: entryFee || 5000,
        paymentStatus: "paid", // Assuming payment is already processed
        paymentDate: new Date(),
        status: "registered",
        isApproved: true, // Auto-approve for now
      });

      await registration.save();

      // Update tournament current squads count
      await Tournament.findByIdAndUpdate(id, {
        $inc: { currentSquads: 1 },
      });

      return reply.status(200).send({
        success: true,
        message: "Successfully registered for tournament",
        registration,
      });
    } catch (error) {
      console.error("Tournament registration error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to register for tournament",
      });
    }
  });
};

export default tournamentRoutes;
