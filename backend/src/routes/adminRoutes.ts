import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authenticateToken } from "../middleware/auth";
import User from "../models/User";
import Squad from "../models/Squad";
import Match from "../models/Match";
import PlayerProfile from "../models/PlayerProfile";
import ProPlayer from "../models/ProPlayer";
import Tournament from "../models/Tournament";
import News from "../models/News";
import BountyCoin from "../models/BountyCoin";
import Message from "../models/Message";
import Notification from "../models/Notification";
import TournamentMatch from "../models/TournamentMatch";
import TournamentRegistration from "../models/TournamentRegistration";
import SquadInvitation from "../models/SquadInvitation";
import SquadApplication from "../models/SquadApplication";
import PurchaseRequest from "../models/PurchaseRequest";
import WithdrawRequest from "../models/WithdrawRequest";
import OrganizationProfile from "../models/OrganizationProfile";
import MatchChat from "../models/MatchChat";
import StreamSession from "../models/StreamSession";
import StreamChat from "../models/StreamChat";
import StreamViewer from "../models/StreamViewer";
import Achievement from "../models/Achievement";
import Badge from "../models/Badge";
import UserAchievement from "../models/UserAchievement";
import UserBadge from "../models/UserBadge";
import LeaderboardEntry from "../models/LeaderboardEntry";

const adminRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Admin routes available",
      timestamp: new Date().toISOString(),
    });
  });

  // Clear all data from all collections
  fastify.delete(
    "/clear-all",
    { preHandler: authenticateToken },
    async (request, reply) => {
      try {
        // Check if user is admin
        const user = (request as any).user;
        if (!user || user.role !== "ADMIN") {
          return reply.status(403).send({
            success: false,
            message: "Unauthorized. Admin access required.",
          });
        }

        // Clear all collections
        const results: any = {};

        // Core collections
        results.users = await User.deleteMany({});
        results.squads = await Squad.deleteMany({});
        results.matches = await Match.deleteMany({});
        results.playerProfiles = await PlayerProfile.deleteMany({});
        results.proPlayers = await ProPlayer.deleteMany({});
        results.tournaments = await Tournament.deleteMany({});
        results.news = await News.deleteMany({});
        results.bountyCoins = await BountyCoin.deleteMany({});

        // Communication collections
        results.messages = await Message.deleteMany({});
        results.notifications = await Notification.deleteMany({});
        results.matchChats = await MatchChat.deleteMany({});

        // Tournament collections
        results.tournamentMatches = await TournamentMatch.deleteMany({});
        results.tournamentRegistrations = 
          await TournamentRegistration.deleteMany({});

        // Squad management collections
        results.squadInvitations = await SquadInvitation.deleteMany({});
        results.squadApplications = await SquadApplication.deleteMany({});

        // Request collections
        results.purchaseRequests = await PurchaseRequest.deleteMany({});
        results.withdrawRequests = await WithdrawRequest.deleteMany({});

        // Profile collections
        results.organizationProfiles = 
          await OrganizationProfile.deleteMany({});

        // Stream collections
        results.streamSessions = await StreamSession.deleteMany({});
        results.streamChats = await StreamChat.deleteMany({});
        results.streamViewers = await StreamViewer.deleteMany({});

        // Achievement collections
        results.achievements = await Achievement.deleteMany({});
        results.badges = await Badge.deleteMany({});
        results.userAchievements = await UserAchievement.deleteMany({});
        results.userBadges = await UserBadge.deleteMany({});

        // Leaderboard collections
        results.leaderboardEntries = await LeaderboardEntry.deleteMany({});

        // Settings collection (keep default settings)
        // results.settings = await Settings.deleteMany({});

        // Prepare summary
        const summary = {
          totalCollections: Object.keys(results).length,
          totalDocumentsDeleted: Object.values(results).reduce(
            (sum: number, result: any) => sum + (result.deletedCount || 0),
            0
          ),
          details: Object.entries(results).map(([key, value]: [string, any]) => ({
            collection: key,
            deleted: value.deletedCount || 0,
          })),
        };

        reply.send({
          success: true,
          message: "All collections cleared successfully",
          summary,
        });
      } catch (error: any) {
        console.error("Error clearing collections:", error);
        reply.status(500).send({
          success: false,
          message: "Failed to clear collections",
          error: error.message,
        });
      }
    }
  );
};

export default adminRoutes;

