import Match, {
  MatchStatus,
  MatchType,
  MatchResult,
  AdminResolution,
} from "../models/Match";
import Squad from "../models/Squad";
import Notification from "../models/Notification";
import MatchChat from "../models/MatchChat";
import mongoose from "mongoose";

export class MatchService {
  // Match үүсгэх
  static async createMatch(
    userId: string,
    type: MatchType,
    opponentSquadId: string | undefined,
    bountyAmount: number,
    deadline: Date
  ) {
    // User-ийн squad олох
    const squad = await Squad.findOne({ leader: userId, isActive: true });

    if (!squad) {
      throw new Error("Та squad-ийн лидер биш байна");
    }

    // Хамгийн багадаа 5 member шаардлагатай
    if (squad.members.length < 5) {
      throw new Error("Squad-д хамгийн багадаа 5 гишүүн байх ёстой");
    }

    // Bounty coin шалгах
    if (squad.currentBountyCoins < bountyAmount) {
      throw new Error("Хангалтгүй bounty coin байна");
    }

    // Deadline ирээдүйд байх ёстой
    if (new Date(deadline) <= new Date()) {
      throw new Error("Deadline ирээдүйд байх ёстой");
    }

    // Private match бол opponent squad шалгах
    if (type === MatchType.PRIVATE) {
      if (!opponentSquadId) {
        throw new Error("Private match-д opponent squad заавал байх ёстой");
      }

      const opponentSquad = await Squad.findById(opponentSquadId);
      if (!opponentSquad) {
        throw new Error("Opponent squad олдсонгүй");
      }

      if (opponentSquad.members.length < 5) {
        throw new Error("Opponent squad-д хамгийн багадаа 5 гишүүн байх ёстой");
      }

      if (opponentSquad.currentBountyCoins < bountyAmount) {
        throw new Error("Opponent squad-д хангалтгүй bounty coin байна");
      }
    }

    // Match үүсгэх
    const match = await Match.create({
      type,
      challengerSquadId: squad._id,
      opponentSquadId: opponentSquadId || undefined,
      bountyAmount,
      deadline,
      status: MatchStatus.PENDING,
      coinsLocked: false,
    });

    // Private match бол notification илгээх
    if (type === MatchType.PRIVATE && opponentSquadId) {
      const opponentSquad = await Squad.findById(opponentSquadId).populate(
        "leader"
      );
      if (opponentSquad) {
        await Notification.create({
          userId: opponentSquad.leader,
          title: "Шинэ match урилга",
          content: `${squad.name} таны багтай ${bountyAmount} bounty coin-ий бооцоотой тоглох хүсэлт илгээлээ`,
          type: "SYSTEM",
        });
      }
    }

    return match;
  }

  // Match accept хийх (leader only)
  static async acceptMatch(matchId: string, userId: string) {
    const match = await Match.findById(matchId);

    if (!match) {
      throw new Error("Match олдсонгүй");
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new Error("Энэ match-ийг accept хийх боломжгүй");
    }

    // User-ийн squad олох
    const squad = await Squad.findOne({ leader: userId, isActive: true });

    if (!squad) {
      throw new Error("Та squad-ийн лидер биш байна");
    }

    // Private match бол зөвхөн урьсан squad accept хийнэ
    if (match.type === MatchType.PRIVATE) {
      if (
        !match.opponentSquadId ||
        match.opponentSquadId.toString() !== squad._id.toString()
      ) {
        throw new Error("Та энэ match-д оролцох эрхгүй");
      }
    } else {
      // Public match - хэн ч accept хийж болно
      if (match.challengerSquadId.toString() === squad._id.toString()) {
        throw new Error("Өөрийн match-ийг accept хийж болохгүй");
      }

      match.opponentSquadId = squad._id as any;
    }

    // Squad шаардлага шалгах
    if (squad.members.length < 5) {
      throw new Error("Squad-д хамгийн багадаа 5 гишүүн байх ёстой");
    }

    if (squad.currentBountyCoins < match.bountyAmount) {
      throw new Error("Хангалтгүй bounty coin байна");
    }

    // Coins lock хийх
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 2 талын coin lock
      await Squad.findByIdAndUpdate(
        match.challengerSquadId,
        {
          $inc: { currentBountyCoins: -match.bountyAmount },
        },
        { session }
      );

      await Squad.findByIdAndUpdate(
        squad._id,
        {
          $inc: { currentBountyCoins: -match.bountyAmount },
        },
        { session }
      );

      match.status = MatchStatus.ACCEPTED;
      match.coinsLocked = true;
      await match.save({ session });

      await session.commitTransaction();

      // Notification илгээх
      const challengerSquad = await Squad.findById(
        match.challengerSquadId
      ).populate("leader");
      if (challengerSquad) {
        await Notification.create({
          userId: challengerSquad.leader,
          title: "Match accepted",
          content: `${squad.name} таны match урилгыг хүлээн авлаа`,
          type: "SYSTEM",
        });
      }

      return match;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
