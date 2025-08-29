import { FastifyInstance, FastifyPluginAsync } from "fastify";
import TournamentMatch from "../models/TournamentMatch";
import Tournament from "../models/Tournament";
import TournamentRegistration from "../models/TournamentRegistration";
import Squad from "../models/Squad";

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

  // Generate tournament brackets (admin only)
  fastify.post("/generate-brackets/:tournamentId", async (request, reply) => {
    try {
      const { tournamentId } = request.params as { tournamentId: string };

      // Get tournament and approved registrations
      const tournament = await Tournament.findById(tournamentId);
      if (!tournament) {
        return reply.status(404).send({
          success: false,
          message: "Tournament not found",
        });
      }

      const registrations = await TournamentRegistration.find({
        tournament: tournamentId,
        isApproved: true,
        paymentStatus: "paid",
      }).populate("squad", "name tag");

      if (registrations.length < 2) {
        return reply.status(400).send({
          success: false,
          message: "Need at least 2 approved squads to generate brackets",
        });
      }

      // Shuffle squads randomly
      const squads = registrations.map((reg: any) => reg.squad);
      const shuffledSquads = [...squads].sort(() => Math.random() - 0.5);

      // Generate matches for first round
      const matches = [];
      let matchNumber = 1;

      for (let i = 0; i < shuffledSquads.length; i += 2) {
        if (i + 1 < shuffledSquads.length) {
          // Create match between two squads
          const match = new TournamentMatch({
            tournament: tournamentId,
            matchNumber,
            round: 1,
            squad1: shuffledSquads[i]._id,
            squad2: shuffledSquads[i + 1]._id,
            status: "scheduled",
          });
          matches.push(match);
          matchNumber++;
        } else {
          // Odd number of squads - give bye to last squad
          const byeMatch = new TournamentMatch({
            tournament: tournamentId,
            matchNumber,
            round: 1,
            squad1: shuffledSquads[i]._id,
            squad2: null, // Bye
            status: "completed",
            winner: shuffledSquads[i]._id,
            isWalkover: true,
            walkoverReason: "Bye",
          });
          matches.push(byeMatch);
          matchNumber++;
        }
      }

      // Save all matches
      await TournamentMatch.insertMany(matches);

      // Update tournament status
      tournament.status = "ongoing";
      await tournament.save();

      return reply.status(201).send({
        success: true,
        message: "Tournament brackets generated successfully",
        matches: matches.length,
        squads: shuffledSquads.length,
      });
    } catch (error) {
      console.error("Generate brackets error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to generate tournament brackets",
      });
    }
  });

  // Get tournament matches
  fastify.get("/tournament/:tournamentId", async (request, reply) => {
    try {
      const { tournamentId } = request.params as { tournamentId: string };
      const { round, status } = request.query as any;

      const query: any = { tournament: tournamentId };

      if (round) {
        query.round = parseInt(round);
      }

      if (status) {
        query.status = status;
      }

      const matches = await TournamentMatch.find(query)
        .populate("squad1", "name tag logo")
        .populate("squad2", "name tag logo")
        .populate("winner", "name tag")
        .populate("loser", "name tag")
        .sort({ round: 1, matchNumber: 1 })
        .lean();

      return reply.status(200).send({
        success: true,
        matches,
      });
    } catch (error) {
      console.error("Get tournament matches error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get tournament matches",
      });
    }
  });

  // Get match by ID
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const match = await TournamentMatch.findById(id)
        .populate("squad1", "name tag logo")
        .populate("squad2", "name tag logo")
        .populate("winner", "name tag")
        .populate("loser", "name tag")
        .lean();

      if (!match) {
        return reply.status(404).send({
          success: false,
          message: "Match not found",
        });
      }

      return reply.status(200).send({
        success: true,
        match,
      });
    } catch (error) {
      console.error("Get match error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get match",
      });
    }
  });

  // Update match result (admin only)
  fastify.put("/:id/result", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const {
        winnerId,
        loserId,
        score,
        adminNotes,
        isWalkover,
        walkoverReason,
      } = request.body as any;

      const match = await TournamentMatch.findById(id);
      if (!match) {
        return reply.status(404).send({
          success: false,
          message: "Match not found",
        });
      }

      // Validate winner and loser
      if (winnerId && loserId) {
        if (winnerId === loserId) {
          return reply.status(400).send({
            success: false,
            message: "Winner and loser cannot be the same",
          });
        }

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
      }

      // Update match
      match.winner = winnerId;
      match.loser = loserId;
      match.status = "completed";
      match.endTime = new Date();
      match.score = score;
      match.adminNotes = adminNotes;
      match.isWalkover = isWalkover || false;
      match.walkoverReason = walkoverReason;

      await match.save();

      // Generate next round match if needed
      await generateNextRoundMatch(match);

      const updatedMatch = await TournamentMatch.findById(id)
        .populate("squad1", "name tag logo")
        .populate("squad2", "name tag logo")
        .populate("winner", "name tag")
        .populate("loser", "name tag")
        .lean();

      return reply.status(200).send({
        success: true,
        message: "Match result updated successfully",
        match: updatedMatch,
      });
    } catch (error) {
      console.error("Update match result error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to update match result",
      });
    }
  });

  // Schedule match (admin only)
  fastify.put("/:id/schedule", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { scheduledTime } = request.body as any;

      const match = await TournamentMatch.findById(id);
      if (!match) {
        return reply.status(404).send({
          success: false,
          message: "Match not found",
        });
      }

      match.scheduledTime = new Date(scheduledTime);
      match.status = "scheduled";
      await match.save();

      const updatedMatch = await TournamentMatch.findById(id)
        .populate("squad1", "name tag logo")
        .populate("squad2", "name tag logo")
        .lean();

      return reply.status(200).send({
        success: true,
        message: "Match scheduled successfully",
        match: updatedMatch,
      });
    } catch (error) {
      console.error("Schedule match error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to schedule match",
      });
    }
  });

  // Start match (admin only)
  fastify.put("/:id/start", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const match = await TournamentMatch.findById(id);
      if (!match) {
        return reply.status(404).send({
          success: false,
          message: "Match not found",
        });
      }

      match.status = "in_progress";
      match.startTime = new Date();
      await match.save();

      const updatedMatch = await TournamentMatch.findById(id)
        .populate("squad1", "name tag logo")
        .populate("squad2", "name tag logo")
        .lean();

      return reply.status(200).send({
        success: true,
        message: "Match started successfully",
        match: updatedMatch,
      });
    } catch (error) {
      console.error("Start match error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to start match",
      });
    }
  });

  // Get tournament bracket view
  fastify.get("/tournament/:tournamentId/bracket", async (request, reply) => {
    try {
      const { tournamentId } = request.params as { tournamentId: string };

      const matches = await TournamentMatch.find({ tournament: tournamentId })
        .populate("squad1", "name tag logo")
        .populate("squad2", "name tag logo")
        .populate("winner", "name tag")
        .populate("loser", "name tag")
        .sort({ round: 1, matchNumber: 1 })
        .lean();

      // Group matches by round
      const bracket = matches.reduce((acc: any, match) => {
        if (!acc[match.round]) {
          acc[match.round] = [];
        }
        acc[match.round].push(match);
        return acc;
      }, {});

      return reply.status(200).send({
        success: true,
        bracket,
        totalRounds: Math.max(...matches.map((m: any) => m.round)),
      });
    } catch (error) {
      console.error("Get tournament bracket error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get tournament bracket",
      });
    }
  });
};

// Helper function to generate next round matches
async function generateNextRoundMatch(currentMatch: any) {
  try {
    const tournament = await Tournament.findById(currentMatch.tournament);
    if (!tournament) return;

    // Get all matches in the current round
    const currentRoundMatches = await TournamentMatch.find({
      tournament: currentMatch.tournament,
      round: currentMatch.round,
    });

    // Check if all matches in current round are completed
    const allCompleted = currentRoundMatches.every(
      (match: any) => match.status === "completed"
    );
    if (!allCompleted) return;

    // Get winners from current round
    const winners = currentRoundMatches
      .filter((match: any) => match.winner)
      .map((match: any) => match.winner);

    if (winners.length < 2) {
      // Tournament finished - update final standings
      if (winners.length === 1) {
        const finalMatch = currentRoundMatches.find(
          (match: any) => match.winner
        );
        if (finalMatch) {
          // Update registration status for winner
          await TournamentRegistration.findOneAndUpdate(
            { tournament: currentMatch.tournament, squad: finalMatch.winner },
            { status: "winner" }
          );

          // Update registration status for runner-up
          const runnerUpMatch = currentRoundMatches.find(
            (match: any) =>
              match.winner &&
              match.winner.toString() !== finalMatch.winner.toString()
          );
          if (runnerUpMatch) {
            await TournamentRegistration.findOneAndUpdate(
              {
                tournament: currentMatch.tournament,
                squad: runnerUpMatch.winner,
              },
              { status: "runner_up" }
            );
          }
        }
      }
      return;
    }

    // Generate next round matches
    const nextRound = currentMatch.round + 1;
    let matchNumber =
      (await TournamentMatch.countDocuments({
        tournament: currentMatch.tournament,
      })) + 1;

    // Shuffle winners for random pairing
    const shuffledWinners = [...winners].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffledWinners.length; i += 2) {
      if (i + 1 < shuffledWinners.length) {
        const nextMatch = new TournamentMatch({
          tournament: currentMatch.tournament,
          matchNumber,
          round: nextRound,
          squad1: shuffledWinners[i],
          squad2: shuffledWinners[i + 1],
          status: "scheduled",
        });
        await nextMatch.save();
        matchNumber++;
      } else {
        // Odd number of winners - give bye to last winner
        const byeMatch = new TournamentMatch({
          tournament: currentMatch.tournament,
          matchNumber,
          round: nextRound,
          squad1: shuffledWinners[i],
          squad2: null,
          status: "completed",
          winner: shuffledWinners[i],
          isWalkover: true,
          walkoverReason: "Bye",
        });
        await byeMatch.save();
        matchNumber++;
      }
    }
  } catch (error) {
    console.error("Generate next round match error:", error);
  }
}

export default tournamentMatchRoutes;
