// Match Service 3 - Dispute operations
import Match, {
  MatchStatus,
  AdminResolution,
  IMatchEvidence,
} from "../models/Match";
import Squad from "../models/Squad";

export class MatchService3 {
  // Create dispute
  static async createDispute(
    matchId: string,
    userId: string,
    evidence?: IMatchEvidence
  ) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error("Match not found");

    if (match.status !== MatchStatus.RESULT_SUBMITTED) {
      throw new Error("Cannot dispute this match");
    }

    // Get user's squad to determine which evidence field to update
    const squad = await Squad.findOne({ leader: userId, isActive: true });
    if (!squad) throw new Error("You are not a squad leader");

    const isChallenger =
      match.challengerSquadId.toString() === squad._id.toString();
    const isOpponent =
      match.opponentSquadId?.toString() === squad._id.toString();

    if (!isChallenger && !isOpponent) {
      throw new Error("You are not part of this match");
    }

    // Set evidence based on which squad is disputing
    if (isChallenger) {
      match.challengerEvidence = evidence;
    } else {
      match.opponentEvidence = evidence;
    }

    match.status = MatchStatus.DISPUTED;
    await match.save();

    return match;
  }

  // Resolve dispute
  static async resolveDispute(
    matchId: string,
    adminId: string,
    resolution: AdminResolution
  ) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error("Match not found");

    match.adminResolution = resolution;
    match.resolvedBy = adminId as any;
    match.resolvedAt = new Date();
    match.status = MatchStatus.COMPLETED;
    await match.save();

    return match;
  }
}

export default MatchService3;
