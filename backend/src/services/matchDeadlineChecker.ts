import Match, { MatchStatus } from "../models/Match";
import { MatchService2 } from "./matchService2";
import Notification from "../models/Notification";
import Squad from "../models/Squad";

export class MatchDeadlineChecker {
  private static interval: NodeJS.Timeout | null = null;

  // Start автоматаар deadline checker (2 минут бүр шалгана)
  static start() {
    if (this.interval) {
      console.log("⚠️ Match deadline checker already running");
      return;
    }

    console.log("✅ Match deadline checker started");

    // 2 минут бүр check хийнэ
    this.interval = setInterval(async () => {
      await this.checkExpiredDeadlines();
    }, 2 * 60 * 1000); // 2 min

    // Шууд 1 удаа ажиллуулна
    this.checkExpiredDeadlines();
  }

  // Stop deadline checker
  static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log("🛑 Match deadline checker stopped");
    }
  }

  // Expired deadline-тай matches-ийг шалгаад auto-complete хийнэ
  static async checkExpiredDeadlines() {
    try {
      const now = new Date();

      // Үр дүн оруулах deadline хугацаа дууссан matches олох
      const expiredMatches = await Match.find({
        status: {
          $in: [MatchStatus.PLAYING, MatchStatus.RESULT_SUBMITTED],
        },
        resultDeadline: { $lte: now },
      })
        .populate("challengerSquadId")
        .populate("opponentSquadId");

      console.log(
        `🔍 Found ${expiredMatches.length} matches with expired deadlines`
      );

      for (const match of expiredMatches) {
        await this.handleExpiredMatch(match);
      }
    } catch (error) {
      console.error("❌ Error checking expired deadlines:", error);
    }
  }

  // Expired match-ийг зохицуулах
  private static async handleExpiredMatch(match: any) {
    try {
      const challengerSquad: any = match.challengerSquadId;
      const opponentSquad: any = match.opponentSquadId;

      console.log(
        `⏰ Processing expired match: ${challengerSquad.name} vs ${opponentSquad.name}`
      );

      // Double-check the match status hasn't changed (prevent duplicate processing)
      const currentMatch = await Match.findById(match._id);
      if (
        !currentMatch ||
        currentMatch.status === MatchStatus.COMPLETED ||
        currentMatch.status === MatchStatus.CANCELLED
      ) {
        console.log(`⏭️  Match ${match._id} already processed, skipping`);
        return;
      }

      // Хоёр тал үр дүн оруулсан эсэхийг шалгах
      if (match.challengerResult && match.opponentResult) {
        // Хоёулаа үр дүн оруулсан харин санал зөрсөн - auto dispute
        match.status = MatchStatus.DISPUTED;
        match.disputeReason =
          "Автоматаар dispute үүссэн: 15 минутын хугацаанд үр дүн тохирохгүй байна";
        await match.save();

        // Admin-д notification илгээх
        const User = (await import("../models/User")).default;
        const admins = await User.find({ role: "ADMIN" });

        for (const admin of admins) {
          await Notification.create({
            userId: admin._id,
            title: "Автомат dispute",
            content: `${challengerSquad.name} vs ${opponentSquad.name} - Deadline хугацаа дууссан, үр дүн зөрсөн`,
            type: "SYSTEM",
          });
        }

        console.log(`🚨 Match ${match._id} автоматаар disputed болсон`);
      } else if (match.challengerResult || match.opponentResult) {
        // 1 тал үр дүн оруулсан - тэр тал ялна
        const submittedResult = match.challengerResult || match.opponentResult;
        const isChallenger = !!match.challengerResult;

        // Үр дүнг баталгаажуулах
        match.challengerResult = isChallenger
          ? submittedResult
          : submittedResult === "WIN"
          ? "LOSS"
          : "WIN";
        match.opponentResult = !isChallenger
          ? submittedResult
          : submittedResult === "WIN"
          ? "LOSS"
          : "WIN";

        // Match дуусгах
        await MatchService2.completeMatch(match);

        // Notifications илгээх
        await Notification.create({
          userId: challengerSquad.leader,
          title: "Match дууссан",
          content:
            "15 минутын deadline хугацаа дууссан тул үр дүн автоматаар батлагдлаа",
          type: "SYSTEM",
        });

        await Notification.create({
          userId: opponentSquad.leader,
          title: "Match дууссан",
          content:
            "15 минутын deadline хугацаа дууссан тул үр дүн автоматаар батлагдлаа",
          type: "SYSTEM",
        });

        console.log(`✅ Match ${match._id} автоматаар дууссан`);
      } else {
        // Хэн ч үр дүн оруулаагүй - тэнцсэн гэж тооцно, coin буцаана
        match.status = MatchStatus.COMPLETED;
        match.completedAt = new Date();

        // Coin буцаах
        await Squad.findByIdAndUpdate(challengerSquad._id, {
          $inc: { currentBountyCoins: match.bountyAmount },
        });

        await Squad.findByIdAndUpdate(opponentSquad._id, {
          $inc: { currentBountyCoins: match.bountyAmount },
        });

        await match.save();

        // Notifications
        await Notification.create({
          userId: challengerSquad.leader,
          title: "Match цуцлагдсан",
          content:
            "15 минутын deadline хугацаанд үр дүн оруулаагүй тул coin буцаагдлаа",
          type: "SYSTEM",
        });

        await Notification.create({
          userId: opponentSquad.leader,
          title: "Match цуцлагдсан",
          content:
            "15 минутын deadline хугацаанд үр дүн оруулаагүй тул coin буцаагдлаа",
          type: "SYSTEM",
        });

        console.log(
          `💰 Match ${match._id} цуцлагдаж, coin буцаагдсан (хэн ч үр дүн оруулаагүй)`
        );
      }
    } catch (error) {
      console.error(`❌ Error handling expired match ${match._id}:`, error);
    }
  }
}
