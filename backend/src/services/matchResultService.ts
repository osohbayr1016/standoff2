import mongoose from "mongoose";
import PlayerProfile from "../models/PlayerProfile";
import MatchLobby from "../models/MatchLobby";
import MatchResult, { ResultStatus } from "../models/MatchResult";

const ELO_CHANGE = 25; // Fixed ELO change per match

export class MatchResultService {
  /**
   * Update ELO for all players in both teams
   * Winners get +25 ELO, losers get -25 ELO
   */
  static async updateTeamElo(
    lobbyId: string,
    winnerTeam: "alpha" | "bravo"
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the lobby with team information
      const lobby = await MatchLobby.findById(lobbyId).session(session);
      if (!lobby) {
        throw new Error("Lobby not found");
      }

      const winnerTeamIds =
        winnerTeam === "alpha" ? lobby.teamAlpha : lobby.teamBravo;
      const loserTeamIds =
        winnerTeam === "alpha" ? lobby.teamBravo : lobby.teamAlpha;

      // Update ELO for winners (+25 ELO, +1 win, +1 total match)
      if (winnerTeamIds.length > 0) {
        await PlayerProfile.updateMany(
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
      }

      // Update ELO for losers (-25 ELO, +1 loss, +1 total match)
      // Use bulkWrite to ensure ELO doesn't go below 0
      if (loserTeamIds.length > 0) {
        const loserProfiles = await PlayerProfile.find({
          userId: { $in: loserTeamIds },
        }).session(session);

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
          await PlayerProfile.bulkWrite(bulkOps, { session });
        }
      }

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
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
  ): Promise<MatchResult> {
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

      // Update ELO for teams
      await this.updateTeamElo(
        matchResult.matchLobbyId.toString(),
        winnerTeam
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

      // Update lobby status to completed (we keep the same status structure)
      // The lobby status is already RESULT_SUBMITTED, so we leave it as is

      await session.commitTransaction();
      return matchResult;
    } catch (error) {
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
  ): Promise<MatchResult> {
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

