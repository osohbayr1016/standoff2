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

      let matches = await TournamentMatch.find({ tournament: tournamentId })
        .populate("squad1", "name tag")
        .populate("squad2", "name tag")
        .populate("winner", "name tag")
        .populate("loser", "name tag")
        .sort({ round: 1, matchNumber: 1 });

      // Auto-generate matches if none exist and tournament has enough squads
      if (matches.length === 0) {
        const tournament = await Tournament.findById(tournamentId);
        if (tournament && (tournament.currentSquads || 0) >= 2) {
          const { generateTournamentMatches } = await import(
            "../services/tournamentMatchService"
          );
          await generateTournamentMatches(tournamentId);

          // Re-fetch after generation
          matches = await TournamentMatch.find({ tournament: tournamentId })
            .populate("squad1", "name tag")
            .populate("squad2", "name tag")
            .populate("winner", "name tag")
            .populate("loser", "name tag")
            .sort({ round: 1, matchNumber: 1 });
        }
      }

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
      const { winnerId, loserId, score, adminNotes, applyLoserDeduction } =
        request.body as any;

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
      if (typeof applyLoserDeduction === "boolean") {
        (match as any).applyLoserDeduction = applyLoserDeduction;
      }

      // Save match first so service can read the updated winner/loser
      await match.save();

      // Process bounty coins and division changes
      await DivisionService.processMatchResult(matchId);

      // If the whole round is completed, auto-generate next round (Single Elimination)
      try {
        const currentRound = match.round;
        const currentTournamentId = match.tournament.toString();

        const roundMatches = await TournamentMatch.find({
          tournament: currentTournamentId,
          round: currentRound,
        })
          .sort({ matchNumber: 1 })
          .lean();

        const allCompleted = roundMatches.every(
          (m) => m.status === "completed"
        );
        if (allCompleted) {
          const winners = roundMatches
            .map((m) => m.winner)
            .filter((w): w is any => !!w);

          if (winners.length >= 2) {
            // Prepare next round matches by pairing winners in order
            const nextRound = currentRound + 1;

            const lastMatch = await TournamentMatch.find({
              tournament: currentTournamentId,
            })
              .sort({ matchNumber: -1 })
              .limit(1);
            let nextMatchNumber = lastMatch[0]?.matchNumber
              ? lastMatch[0].matchNumber + 1
              : 1;

            const newMatches: any[] = [];
            for (let i = 0; i < winners.length; i += 2) {
              if (winners[i] && winners[i + 1]) {
                newMatches.push({
                  tournament: match.tournament,
                  matchNumber: nextMatchNumber++,
                  round: nextRound,
                  squad1: winners[i],
                  squad2: winners[i + 1],
                  status: "scheduled",
                  scheduledTime: new Date(),
                  bountyCoinAmount: 50,
                  matchType: "normal",
                });
              }
            }

            if (newMatches.length > 0) {
              await TournamentMatch.insertMany(newMatches);
            } else if (winners.length === 1) {
              // Edge case: only one winner remains
              await Tournament.findByIdAndUpdate(currentTournamentId, {
                status: "completed",
                endDate: new Date(),
              });
            }
          } else if (winners.length === 1) {
            // Tournament finished
            await Tournament.findByIdAndUpdate(currentTournamentId, {
              status: "completed",
              endDate: new Date(),
            });
          }
        }
      } catch (e) {
        console.error("Auto-advance round error:", e);
      }

      // Return the updated match
      const updatedMatch = await TournamentMatch.findById(matchId)
        .populate("squad1", "name tag")
        .populate("squad2", "name tag")
        .populate("winner", "name tag")
        .populate("loser", "name tag");

      return reply.status(200).send({
        success: true,
        message: "Match result updated successfully",
        match: updatedMatch,
      });
    } catch (error) {
      console.error("Error updating match result:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to update match result",
        error:
          process.env.NODE_ENV === "development"
            ? (error as any).message
            : undefined,
      });
    }
  });

  // Update bounty coin settings for a match (admin only)
  fastify.put("/:matchId/bounty", async (request, reply) => {
    try {
      const { matchId } = request.params as { matchId: string };
      const { bountyCoinAmount, applyLoserDeduction } = request.body as {
        bountyCoinAmount?: number;
        applyLoserDeduction?: boolean;
      };

      const match = await TournamentMatch.findById(matchId);
      if (!match) {
        return reply
          .status(404)
          .send({ success: false, message: "Match not found" });
      }

      if (typeof bountyCoinAmount === "number") {
        match.bountyCoinAmount = Math.max(0, bountyCoinAmount);
      }
      if (typeof applyLoserDeduction === "boolean") {
        (match as any).applyLoserDeduction = applyLoserDeduction;
      }

      await match.save();

      return reply.status(200).send({
        success: true,
        message: "Bounty settings updated",
        match,
      });
    } catch (error) {
      console.error("Error updating match bounty settings:", error);
      return reply
        .status(500)
        .send({ success: false, message: "Failed to update bounty settings" });
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
