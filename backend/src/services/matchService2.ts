import Match, {
  MatchStatus,
  MatchResult,
  AdminResolution,
} from "../models/Match";
import Squad from "../models/Squad";
import Notification from "../models/Notification";
import MatchChat from "../models/MatchChat";
import mongoose from "mongoose";

export class MatchService2 {
  // Тоглолт эхэлсэн гэж батлах
  static async startMatch(matchId: string, userId: string) {
    const match = await Match.findById(matchId)
      .populate("challengerSquadId")
      .populate("opponentSquadId");

    if (!match) {
      throw new Error("Match олдсонгүй");
    }

    if (match.status !== MatchStatus.ACCEPTED) {
      throw new Error("Match accepted байхгүй байна");
    }

    // Leader эрх шалгах
    const challengerSquad: any = match.challengerSquadId;
    const opponentSquad: any = match.opponentSquadId;

    const isChallenger = challengerSquad.leader.toString() === userId;
    const isOpponent = opponentSquad.leader.toString() === userId;

    if (!isChallenger && !isOpponent) {
      throw new Error("Зөвхөн leader тоглолт эхлүүлэх эрхтэй");
    }

    // 2 тал батлах хэрэгтэй (энд хялбараар 1 тал батлахад шууд эхлүүлнэ)
    match.status = MatchStatus.PLAYING;
    match.startedAt = new Date();
    // 15 минутын deadline
    match.resultDeadline = new Date(Date.now() + 15 * 60 * 1000);
    await match.save();

    // Notification илгээх
    const otherLeaderId = isChallenger
      ? opponentSquad.leader
      : challengerSquad.leader;
    await Notification.create({
      userId: otherLeaderId,
      title: "Тоглолт эхэллээ",
      content: "Тоглолт эхэлсэн гэж баталгаажлаа",
      type: "SYSTEM",
    });

    return match;
  }

  // Үр дүн оруулах
  static async submitResult(
    matchId: string,
    userId: string,
    result: MatchResult
  ) {
    const match = await Match.findById(matchId)
      .populate("challengerSquadId")
      .populate("opponentSquadId");

    if (!match) {
      throw new Error("Match олдсонгүй");
    }

    if (
      match.status !== MatchStatus.PLAYING &&
      match.status !== MatchStatus.RESULT_SUBMITTED
    ) {
      throw new Error("Тоглолт playing статустай байхгүй байна");
    }

    // Leader эрх шалгах
    const challengerSquad: any = match.challengerSquadId;
    const opponentSquad: any = match.opponentSquadId;

    const isChallenger = challengerSquad.leader.toString() === userId;
    const isOpponent = opponentSquad.leader.toString() === userId;

    if (!isChallenger && !isOpponent) {
      throw new Error("Зөвхөн leader үр дүн оруулах эрхтэй");
    }

    // Үр дүн оруулах
    if (isChallenger) {
      if (match.challengerResult) {
        throw new Error("Та аль хэдийн үр дүн оруулсан байна");
      }
      match.challengerResult = result;
    } else {
      if (match.opponentResult) {
        throw new Error("Та аль хэдийн үр дүн оруулсан байна");
      }
      match.opponentResult = result;
    }

    // 2 тал үр дүн оруулсан эсэхийг шалгах
    if (match.challengerResult && match.opponentResult) {
      // Үр дүн таарч байгаа эсэхийг шалгах
      const resultsMatch =
        (match.challengerResult === MatchResult.WIN &&
          match.opponentResult === MatchResult.LOSS) ||
        (match.challengerResult === MatchResult.LOSS &&
          match.opponentResult === MatchResult.WIN);

      if (resultsMatch) {
        // Үр дүн таарсан - match дуусгах
        return await this.completeMatch(match);
      } else {
        // Үр дүн таарахгүй - dispute руу шилжинэ
        match.status = MatchStatus.RESULT_SUBMITTED;
        match.disputeReason = "Үр дүн зөрж байна";
      }
    } else {
      match.status = MatchStatus.RESULT_SUBMITTED;
    }

    await match.save();

    // Notification илгээх
    const otherLeaderId = isChallenger
      ? opponentSquad.leader
      : challengerSquad.leader;
    await Notification.create({
      userId: otherLeaderId,
      title: "Үр дүн оруулсан",
      content: "Нөгөө баг үр дүнгээ оруулсан байна",
      type: "SYSTEM",
    });

    return match;
  }

  // Match дуусгах (coin шилжүүлэх)
  static async completeMatch(match: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const winnerId =
        match.challengerResult === MatchResult.WIN
          ? match.challengerSquadId._id
          : match.opponentSquadId._id;

      const loserId =
        match.challengerResult === MatchResult.LOSS
          ? match.challengerSquadId._id
          : match.opponentSquadId._id;

      // Ялагчид coin өгөх (2x bounty)
      await Squad.findByIdAndUpdate(
        winnerId,
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

      // Хожигдогчийн stats шинэчлэх
      await Squad.findByIdAndUpdate(
        loserId,
        {
          $inc: {
            "matchStats.losses": 1,
            "matchStats.totalMatches": 1,
            "matchStats.totalEarned": -match.bountyAmount,
          },
        },
        { session }
      );

      // Win rate шинэчлэх
      const winnerSquad = await Squad.findById(winnerId);
      const loserSquad = await Squad.findById(loserId);

      if (winnerSquad) {
        winnerSquad.matchStats.winRate =
          (winnerSquad.matchStats.wins / winnerSquad.matchStats.totalMatches) *
          100;
        await winnerSquad.save({ session });
      }

      if (loserSquad) {
        loserSquad.matchStats.winRate =
          (loserSquad.matchStats.wins / loserSquad.matchStats.totalMatches) *
          100;
        await loserSquad.save({ session });
      }

      match.status = MatchStatus.COMPLETED;
      match.winnerId = winnerId;
      match.completedAt = new Date();
      await match.save({ session });

      await session.commitTransaction();

      return match;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
