import { FastifyInstance, FastifyPluginAsync } from "fastify";
import TournamentMatch from "../models/TournamentMatch";
import Tournament from "../models/Tournament";
import TournamentRegistration from "../models/TournamentRegistration";
import Squad from "../models/Squad";
import { DivisionService } from "../services/divisionService";

const tournamentMatchRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  // Health check
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Tournament match routes available",
      timestamp: new Date().toISOString(),
    });
  });

  // Generate matches for a tournament when it starts
  fastify.post("/generate/:tournamentId", async (request, reply) => {
    try {
      const { tournamentId } = request.params as { tournamentId: string };

      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return reply.status(404).send({
          success: false,
          message: "Tournament not found",
        });
      }

      if (tournament.status !== "ongoing") {
        return reply.status(400).send({
          success: false,
          message: "Tournament must be in 'ongoing' status to generate matches",
        });
      }

      // Get all registered squads for this tournament
      const registrations = await TournamentRegistration.find({
        tournament: tournamentId,
        status: "approved",
      }).populate("squad");

      if (registrations.length < 2) {
        return reply.status(400).send({
          success: false,
          message: "Need at least 2 squads to generate matches",
        });
      }

      // Check if matches already exist
      const existingMatches = await TournamentMatch.find({
        tournament: tournamentId,
      });
      if (existingMatches.length > 0) {
        return reply.status(400).send({
          success: false,
          message: "Matches already generated for this tournament",
        });
      }

      // Generate matches using the service
      const { generateTournamentMatches } = await import(
        "../services/tournamentMatchService"
      );
      await generateTournamentMatches(tournamentId);

      // Get the generated matches
      const matches = await TournamentMatch.find({ tournament: tournamentId });

      return reply.status(201).send({
        success: true,
        message: `Generated ${matches.length} matches for tournament ${tournament.name}`,
        matchCount: matches.length,
      });
    } catch (error) {
      console.error("Error generating tournament matches:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to generate tournament matches",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  // Get all matches for a tournament
  fastify.get("/tournament/:tournamentId", async (request, reply) => {
    try {
      const { tournamentId } = request.params as { tournamentId: string };

      const matches = await TournamentMatch.find({ tournament: tournamentId })
        .populate("squad1", "name tag")
        .populate("squad2", "name tag")
        .populate("winner", "name tag")
        .populate("loser", "name tag")
        .sort({ round: 1, matchNumber: 1 });

      return reply.status(200).send({
        success: true,
        matches,
      });
    } catch (error) {
      console.error("Error getting tournament matches:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get tournament matches",
      });
    }
  });

  // Update match result (admin only)
  fastify.put("/:matchId/result", async (request, reply) => {
    try {
      const { matchId } = request.params as { matchId: string };
      const { winnerId, loserId, score, adminNotes } = request.body as any;

      if (!winnerId || !loserId) {
        return reply.status(400).send({
          success: false,
          message: "Winner and loser IDs are required",
        });
      }

      const match = await TournamentMatch.findById(matchId);
      if (!match) {
        return reply.status(404).send({
          success: false,
          message: "Match not found",
        });
      }

      if (match.status === "completed") {
        return reply.status(400).send({
          success: false,
          message: "Match already completed",
        });
      }

      // Validate winner and loser
      if (
        winnerId !== match.squad1.toString() &&
        winnerId !== match.squad2.toString()
      ) {
        return reply.status(400).send({
          success: false,
          message: "Winner must be one of the participating squads",
        });
      }

      if (
        loserId !== match.squad1.toString() &&
        loserId !== match.squad2.toString()
      ) {
        return reply.status(400).send({
          success: false,
          message: "Loser must be one of the participating squads",
        });
      }

      if (winnerId === loserId) {
        return reply.status(400).send({
          success: false,
          message: "Winner and loser cannot be the same",
        });
      }

      // Update match
      match.winner = winnerId;
      match.loser = loserId;
      match.status = "completed";
      match.endTime = new Date();
      match.score = score;
      match.adminNotes = adminNotes;

      // Process bounty coins and division changes
      await DivisionService.processMatchResult(matchId);

      await match.save();

      return reply.status(200).send({
        success: true,
        message: "Match result updated successfully",
        match,
      });
    } catch (error) {
      console.error("Error updating match result:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to update match result",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  // Get match statistics for a tournament
  fastify.get("/tournament/:tournamentId/stats", async (request, reply) => {
    try {
      const { tournamentId } = request.params as { tournamentId: string };

      const matches = await TournamentMatch.find({ tournament: tournamentId });

      const totalMatches = matches.length;
      const completedMatches = matches.filter(
        (m) => m.status === "completed"
      ).length;
      const pendingMatches = matches.filter(
        (m) => m.status === "scheduled"
      ).length;
      const inProgressMatches = matches.filter(
        (m) => m.status === "in_progress"
      ).length;

      // Get squad statistics using the service
      const { getSquadStats } = await import(
        "../services/tournamentMatchService"
      );
      const squadStats = getSquadStats(matches);

      return reply.status(200).send({
        success: true,
        stats: {
          totalMatches,
          completedMatches,
          pendingMatches,
          inProgressMatches,
          squadStats,
        },
      });
    } catch (error) {
      console.error("Error getting tournament stats:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get tournament statistics",
      });
    }
  });
};

export default tournamentMatchRoutes;
