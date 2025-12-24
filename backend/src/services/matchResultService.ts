import mongoose from "mongoose";
import PlayerProfile from "../models/PlayerProfile";
import MatchLobby from "../models/MatchLobby";
import MatchResult, { IMatchResult, ResultStatus } from "../models/MatchResult";

const ELO_CHANGE = 25; // Fixed ELO change per match

export class MatchResultService {
  /**
   * Update ELO for all players in both teams
   * Winners get +25 ELO, losers get -25 ELO
   */
  static async updateTeamElo(
    lobbyId: string,
    winnerTeam: "alpha" | "bravo",
    session: mongoose.ClientSession
  ): Promise<void> {
    try {
      console.log(`[ELO Update] Starting ELO update for lobby ${lobbyId}, winner: ${winnerTeam}`);
      
      // Get the lobby with team information
      const lobby = await MatchLobby.findById(lobbyId).session(session);
      if (!lobby) {
        throw new Error("Lobby not found");
      }

      let winnerTeamIds: mongoose.Types.ObjectId[] = 
        winnerTeam === "alpha" ? lobby.teamAlpha : lobby.teamBravo;
      let loserTeamIds: mongoose.Types.ObjectId[] = 
        winnerTeam === "alpha" ? lobby.teamBravo : lobby.teamAlpha;

      // Fallback: If specialized team arrays are empty, use the players array
      if (winnerTeamIds.length === 0 || loserTeamIds.length === 0) {
        console.log(`[ELO Update] Specialized team arrays are empty. Falling back to players array.`);
        winnerTeamIds = lobby.players
          .filter(p => p.team === winnerTeam)
          .map(p => p.userId);
        
        loserTeamIds = lobby.players
          .filter(p => p.team === (winnerTeam === "alpha" ? "bravo" : "alpha"))
          .map(p => p.userId);
      }

      console.log(`[ELO Update] Winner IDs: ${winnerTeamIds.length}, Loser IDs: ${loserTeamIds.length}`);

      // Update ELO for winners (+25 ELO, +1 win, +1 total match)
      if (winnerTeamIds.length > 0) {
        const result = await PlayerProfile.updateMany(
          { userId: { $in: winnerTeamIds } },
          {
            $inc: {
              elo: ELO_CHANGE,
              wins: 1,
              totalMatches: 1,
            },
          },
          { session }
        );
        console.log(`[ELO Update] Updated ${result.modifiedCount} winner profiles`);
      }

      // Update ELO for losers (-25 ELO, +1 loss, +1 total match)
      // Use bulkWrite to ensure ELO doesn't go below 0
      if (loserTeamIds.length > 0) {
        const loserProfiles = await PlayerProfile.find({
          userId: { $in: loserTeamIds },
        }).session(session);

        console.log(`[ELO Update] Found ${loserProfiles.length} loser profiles to update`);

        const bulkOps = loserProfiles.map((profile) => ({
          updateOne: {
            filter: { _id: profile._id },
            update: {
              $inc: {
                losses: 1,
                totalMatches: 1,
              },
              $set: {
                elo: Math.max(0, profile.elo - ELO_CHANGE),
              },
            },
          },
        }));

        if (bulkOps.length > 0) {
          const bulkResult = await PlayerProfile.bulkWrite(bulkOps, { session });
          console.log(`[ELO Update] Bulk updated ${bulkResult.modifiedCount} loser profiles`);
        }
      }
    } catch (error) {
      console.error("[ELO Update] Error during ELO update:", error);
      throw error;
    }
  }

  /**
   * Approve a match result and update ELO
   */
  static async approveResult(
    resultId: string,
    winnerTeam: "alpha" | "bravo",
    moderatorId: string,
    moderatorNotes?: string
  ): Promise<IMatchResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the match result
      const matchResult = await MatchResult.findById(resultId).session(session);
      if (!matchResult) {
        throw new Error("Match result not found");
      }

      if (matchResult.status !== ResultStatus.PENDING) {
        throw new Error("Match result is not pending");
      }

      // Update ELO for teams - PASS THE SESSION
      await this.updateTeamElo(
        matchResult.matchLobbyId.toString(),
        winnerTeam,
        session
      );

      // Update match result status
      matchResult.status = ResultStatus.APPROVED;
      matchResult.winnerTeam = winnerTeam;
      matchResult.reviewedBy = new mongoose.Types.ObjectId(moderatorId);
      matchResult.reviewedAt = new Date();
      if (moderatorNotes) {
        matchResult.moderatorNotes = moderatorNotes;
      }

      await matchResult.save({ session });

      await session.commitTransaction();
      return matchResult;
    } catch (error) {
      console.error("[Approve Result] Error:", error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Reject/dispute a match result
   */
  static async rejectResult(
    resultId: string,
    moderatorId: string,
    reviewNotes?: string
  ): Promise<IMatchResult> {
    const matchResult = await MatchResult.findById(resultId);
    if (!matchResult) {
      throw new Error("Match result not found");
    }

    if (matchResult.status !== ResultStatus.PENDING) {
      throw new Error("Match result is not pending");
    }

    matchResult.status = ResultStatus.REJECTED;
    matchResult.reviewedBy = new mongoose.Types.ObjectId(moderatorId);
    matchResult.reviewedAt = new Date();
    if (reviewNotes) {
      matchResult.reviewNotes = reviewNotes;
    }

    await matchResult.save();
    return matchResult;
  }
}

export default MatchResultService;

