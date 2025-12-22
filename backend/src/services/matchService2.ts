// Match Service 2 - Start, Result, Complete operations
import Match, { MatchStatus, MatchResult } from "../models/Match";
import Squad from "../models/Squad";
import Notification from "../models/Notification";
import mongoose from "mongoose";

export class MatchService2 {
  // Start match
  static async startMatch(matchId: string, userId: string) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error("Match not found");

    const squad = await Squad.findOne({ leader: userId, isActive: true });
    if (!squad) throw new Error("You are not a squad leader");

    const isChallenger =
      match.challengerSquadId.toString() === squad._id.toString();
    const isOpponent =
      match.opponentSquadId?.toString() === squad._id.toString();

    if (!isChallenger && !isOpponent) {
      throw new Error("You are not part of this match");
    }

    if (match.status !== MatchStatus.ACCEPTED) {
      throw new Error("Cannot start this match");
    }

    match.status = MatchStatus.PLAYING;
    match.startedAt = new Date();
    await match.save();

    return match;
  }

  // Submit result
  static async submitResult(
    matchId: string,
    userId: string,
    result: MatchResult
  ) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error("Match not found");

    const squad = await Squad.findOne({ leader: userId, isActive: true });
    if (!squad) throw new Error("You are not a squad leader");

    match.status = MatchStatus.RESULT_SUBMITTED;
    await match.save();

    return match;
  }

  // Complete match
  static async completeMatch(matchId: string) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error("Match not found");

    match.status = MatchStatus.COMPLETED;
    await match.save();

    return match;
  }

  // Check expired matches
  static async checkExpiredMatches() {
    const expiredMatches = await Match.find({
      status: MatchStatus.PENDING,
      deadline: { $lt: new Date() },
    });
    return expiredMatches;
  }
}

export default MatchService2;
