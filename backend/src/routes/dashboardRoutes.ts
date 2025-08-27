import { FastifyInstance, FastifyPluginAsync } from "fastify";
import News from "../models/News";
import PlayerProfile from "../models/PlayerProfile";
import User from "../models/User";
import Tournament from "../models/Tournament";

const dashboardRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance
) => {
  // Get dashboard statistics
  fastify.get("/stats", async (request, reply) => {
    try {
      // Get news statistics
      const [totalNews, recentNews] = await Promise.all([
        News.countDocuments(),
        News.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      // Get user statistics
      const [totalUsers, recentUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      // Get player profile statistics
      const [totalProfiles, recentProfiles] = await Promise.all([
        PlayerProfile.countDocuments(),
        PlayerProfile.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      // Get tournament statistics
      const [totalTournaments, recentTournaments] = await Promise.all([
        Tournament.countDocuments(),
        Tournament.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

      // Get recent activity
      const recentNewsItems = await News.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt type")
        .lean();

      const recentUsersItems = await User.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select("name email createdAt")
        .lean();

      const recentProfilesItems = await PlayerProfile.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select("inGameName rank createdAt")
        .lean();

      const recentTournamentsItems = await Tournament.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select("name game status createdAt")
        .lean();

      return reply.status(200).send({
        success: true,
        stats: {
          news: { total: totalNews, new: recentNews },
          users: { total: totalUsers, new: recentUsers },
          profiles: { total: totalProfiles, new: recentProfiles },
          tournaments: { total: totalTournaments, new: recentTournaments },
        },
        recentActivity: {
          news: recentNewsItems,
          users: recentUsersItems,
          profiles: recentProfilesItems,
          tournaments: recentTournamentsItems,
        },
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get dashboard statistics",
      });
    }
  });

  // Get recent activity
  fastify.get("/activity", async (request, reply) => {
    try {
      const { limit = 10 } = request.query as any;

      // Get recent news
      const recentNews = await News.find()
        .sort({ createdAt: -1 })
        .limit(Math.floor(limit / 2))
        .select("title createdAt type category")
        .lean();

      // Get recent user registrations
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(Math.floor(limit / 2))
        .select("name email createdAt")
        .lean();

      // Get recent profile creations
      const recentProfiles = await PlayerProfile.find()
        .sort({ createdAt: -1 })
        .limit(Math.floor(limit / 3))
        .select("inGameName rank createdAt")
        .lean();

      // Get recent tournament creations
      const recentTournaments = await Tournament.find()
        .sort({ createdAt: -1 })
        .limit(Math.floor(limit / 3))
        .select("name game status createdAt")
        .lean();

      // Combine and sort all activities
      const activities = [
        ...recentNews.map((item) => ({
          id: item._id,
          type: "news",
          title: `News article created: "${item.title}"`,
          subtitle: item.category,
          timestamp: item.createdAt,
          icon: "newspaper",
        })),
        ...recentUsers.map((item) => ({
          id: item._id,
          type: "user",
          title: `New user registered: ${item.name || item.email}`,
          subtitle: item.email,
          timestamp: item.createdAt,
          icon: "user",
        })),
        ...recentProfiles.map((item) => ({
          id: item._id,
          type: "profile",
          title: `Player profile created: ${item.inGameName}`,
          subtitle: item.rank,
          timestamp: item.createdAt,
          icon: "shield",
        })),
        ...recentTournaments.map((item) => ({
          id: item._id,
          type: "tournament",
          title: `Tournament created: "${item.name}"`,
          subtitle: `${item.game} - ${item.status}`,
          timestamp: item.createdAt,
          icon: "trophy",
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, limit);

      return reply.status(200).send({
        success: true,
        activities,
      });
    } catch (error) {
      console.error("Dashboard activity error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get recent activity",
      });
    }
  });

  // Health check
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Dashboard routes available",
      timestamp: new Date().toISOString(),
    });
  });
};

export default dashboardRoutes;
