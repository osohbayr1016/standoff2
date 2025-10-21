import Match, {
  MatchStatus,
  AdminResolution,
  IMatchEvidence,
} from "../models/Match";
import Squad from "../models/Squad";
import Notification from "../models/Notification";
import mongoose from "mongoose";

export class MatchService3 {
  // Dispute үүсгэх (evidence + text)
  static async createDispute(
    matchId: string,
    userId: string,
    evidence: IMatchEvidence
  ) {
    const match = await Match.findById(matchId)
      .populate("challengerSquadId")
      .populate("opponentSquadId");

    if (!match) {
      throw new Error("Match олдсонгүй");
    }

    if (
      match.status !== MatchStatus.RESULT_SUBMITTED &&
      match.status !== MatchStatus.PLAYING
    ) {
      throw new Error("Dispute үүсгэх боломжгүй");
    }

    // Leader эрх шалгах
    const challengerSquad: any = match.challengerSquadId;
    const opponentSquad: any = match.opponentSquadId;

    const isChallenger = challengerSquad.leader.toString() === userId;
    const isOpponent = opponentSquad.leader.toString() === userId;

    if (!isChallenger && !isOpponent) {
      throw new Error("Зөвхөн leader dispute үүсгэх эрхтэй");
    }

    // Evidence хадгалах
    if (isChallenger) {
      match.challengerEvidence = evidence;
    } else {
      match.opponentEvidence = evidence;
    }

    match.status = MatchStatus.DISPUTED;
    await match.save();

    // Admin-д notification илгээх
    const admins = await import("../models/User").then((m) =>
      m.default.find({ role: "ADMIN" })
    );

    for (const admin of admins) {
      await Notification.create({
        userId: admin._id,
        title: "Шинэ dispute",
        content: `${challengerSquad.name} vs ${opponentSquad.name} - Dispute шийдвэрлүүлэх хүсэлт`,
        type: "SYSTEM",
      });
    }

    return match;
  }

  // Admin dispute шийдвэрлэх
  static async resolveDispute(
    matchId: string,
    adminId: string,
    resolution: AdminResolution
  ) {
    const match = await Match.findById(matchId)
      .populate("challengerSquadId")
      .populate("opponentSquadId");

    if (!match) {
      throw new Error("Match олдсонгүй");
    }

    if (match.status !== MatchStatus.DISPUTED) {
      throw new Error("Match disputed статустай байхгүй байна");
    }

    // Check if both sides submitted NO evidence (no images and no text)
    const challengerHasEvidence =
      match.challengerEvidence?.images?.length > 0 ||
      match.challengerEvidence?.description;
    const opponentHasEvidence =
      match.opponentEvidence?.images?.length > 0 ||
      match.opponentEvidence?.description;

    // If neither side has evidence, force CANCELLED resolution
    if (!challengerHasEvidence && !opponentHasEvidence) {
      resolution = AdminResolution.CANCELLED;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const challengerSquad: any = match.challengerSquadId;
      const opponentSquad: any = match.opponentSquadId;

      match.adminResolution = resolution;
      match.resolvedBy = adminId as any;
      match.resolvedAt = new Date();

      switch (resolution) {
        case AdminResolution.SQUAD_A_WON:
          // Challenger ялсан
          await Squad.findByIdAndUpdate(
            challengerSquad._id,
            {
              $inc: {
                currentBountyCoins: match.bountyAmount * 2,
                "matchStats.wins": 1,
                "matchStats.totalMatches": 1,
                "matchStats.totalEarned": match.bountyAmount,
              },
            },
            { session }
          );

          await Squad.findByIdAndUpdate(
            opponentSquad._id,
            {
              $inc: {
                "matchStats.losses": 1,
                "matchStats.totalMatches": 1,
                "matchStats.totalEarned": -match.bountyAmount,
              },
            },
            { session }
          );

          match.winnerId = challengerSquad._id;
          break;

        case AdminResolution.SQUAD_B_WON:
          // Opponent ялсан
          await Squad.findByIdAndUpdate(
            opponentSquad._id,
            {
              $inc: {
                currentBountyCoins: match.bountyAmount * 2,
                "matchStats.wins": 1,
                "matchStats.totalMatches": 1,
                "matchStats.totalEarned": match.bountyAmount,
              },
            },
            { session }
          );

          await Squad.findByIdAndUpdate(
            challengerSquad._id,
            {
              $inc: {
                "matchStats.losses": 1,
                "matchStats.totalMatches": 1,
                "matchStats.totalEarned": -match.bountyAmount,
              },
            },
            { session }
          );

          match.winnerId = opponentSquad._id;
          break;

        case AdminResolution.DRAW:
        case AdminResolution.CANCELLED:
          // Coin буцаах
          await Squad.findByIdAndUpdate(
            challengerSquad._id,
            {
              $inc: { currentBountyCoins: match.bountyAmount },
            },
            { session }
          );

          await Squad.findByIdAndUpdate(
            opponentSquad._id,
            {
              $inc: { currentBountyCoins: match.bountyAmount },
            },
            { session }
          );

          if (resolution === AdminResolution.DRAW) {
            await Squad.findByIdAndUpdate(
              challengerSquad._id,
              {
                $inc: { "matchStats.draws": 1, "matchStats.totalMatches": 1 },
              },
              { session }
            );

            await Squad.findByIdAndUpdate(
              opponentSquad._id,
              {
                $inc: { "matchStats.draws": 1, "matchStats.totalMatches": 1 },
              },
              { session }
            );
          }
          break;
      }

      match.status = MatchStatus.COMPLETED;
      match.completedAt = new Date();
      await match.save({ session });

      // Win rate шинэчлэх
      await this.updateWinRates(
        challengerSquad._id,
        opponentSquad._id,
        session
      );

      await session.commitTransaction();

      // Notifications илгээх
      await this.sendResolutionNotifications(
        match,
        challengerSquad,
        opponentSquad,
        resolution
      );

      return match;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private static async updateWinRates(
    squad1Id: any,
    squad2Id: any,
    session: any
  ) {
    for (const squadId of [squad1Id, squad2Id]) {
      const squad = await Squad.findById(squadId);
      if (squad && squad.matchStats.totalMatches > 0) {
        squad.matchStats.winRate =
          (squad.matchStats.wins / squad.matchStats.totalMatches) * 100;
        await squad.save({ session });
      }
    }
  }

  private static async sendResolutionNotifications(
    match: any,
    challengerSquad: any,
    opponentSquad: any,
    resolution: AdminResolution
  ) {
    let message = "";

    switch (resolution) {
      case AdminResolution.SQUAD_A_WON:
        message = `${challengerSquad.name} ялалт байлаа`;
        break;
      case AdminResolution.SQUAD_B_WON:
        message = `${opponentSquad.name} ялалт байлаа`;
        break;
      case AdminResolution.DRAW:
        message = "Тэнцсэн гэж тооцогдлоо";
        break;
      case AdminResolution.CANCELLED:
        message = "Match цуцлагдсан";
        break;
    }

    await Notification.create({
      userId: challengerSquad.leader,
      title: "Dispute шийдэгдлээ",
      content: message,
      type: "SYSTEM",
    });

    await Notification.create({
      userId: opponentSquad.leader,
      title: "Dispute шийдэгдлээ",
      content: message,
      type: "SYSTEM",
    });
  }
}
