// Match Service 4 - Cancel and Chat operations
import Match, { MatchStatus } from "../models/Match";
import MatchChat from "../models/MatchChat";
import Squad from "../models/Squad";

export class MatchService4 {
  // Cancel match
  static async cancelMatch(matchId: string, userId: string) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error("Match not found");

    const squad = await Squad.findOne({ leader: userId, isActive: true });
    if (!squad) throw new Error("You are not a squad leader");

    if (match.challengerSquadId.toString() !== squad._id.toString()) {
      throw new Error("Only the challenger can cancel");
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new Error("Cannot cancel this match");
    }

    match.status = MatchStatus.CANCELLED;
    await match.save();

    return match;
  }

  // Get chat messages
  static async getChatMessages(matchId: string, userId: string) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error("Match not found");

    const messages = await MatchChat.find({ matchId })
      .populate("senderId", "name avatar")
      .sort({ createdAt: 1 });

    return messages;
  }

  // Send chat message
  static async sendChatMessage(
    matchId: string,
    userId: string,
    message: string
  ) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error("Match not found");

    const chatMessage = await MatchChat.create({
      matchId,
      senderId: userId,
      message,
    });

    return chatMessage;
  }
}

export default MatchService4;
