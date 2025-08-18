import { Router, Request, Response } from "express";
import PlayerProfile from "../models/PlayerProfile";
import User, { UserRole } from "../models/User";
import faceitService from "../utils/faceitService";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Link FACEIT account (protected endpoint)
router.post("/link", authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if FACEIT service is enabled
    if (!faceitService.isServiceEnabled()) {
      return res.status(503).json({
        success: false,
        message:
          "FACEIT integration is currently disabled. Please contact administrator.",
      });
    }

    const userId = (req.user as any).id;
    const { faceitNickname } = req.body;

    if (!faceitNickname || faceitNickname.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "FACEIT nickname шаардлагатай",
      });
    }

    // Check if user is a player
    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.PLAYER) {
      return res.status(403).json({
        success: false,
        message: "Зөвхөн тоглогчид FACEIT аккаунт холбох боломжтой",
      });
    }

    // Get user's player profile
    const playerProfile = await PlayerProfile.findOne({ userId });
    if (!playerProfile) {
      return res.status(404).json({
        success: false,
        message: "Тоглогчийн профайл олдсонгүй. Эхлээд профайл үүсгэнэ үү",
      });
    }

    // Check if profile is for CS2
    if (
      playerProfile.game !== "CS2" &&
      playerProfile.game !== "Counter-Strike 2"
    ) {
      return res.status(400).json({
        success: false,
        message: "FACEIT холболт зөвхөн CS2 тоглогчидад зориулагдсан",
      });
    }

    // Check if FACEIT nickname is already linked to another player
    const existingProfile = await PlayerProfile.findOne({
      "faceitData.nickname": faceitNickname.trim(),
      userId: { $ne: userId },
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Энэ FACEIT аккаунтыг аль хэдийн өөр тоглогч холбосон байна",
      });
    }

    // Fetch FACEIT data
    let faceitData;
    try {
      faceitData = await faceitService.getFormattedPlayerData(
        faceitNickname.trim()
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `FACEIT мэдээлэл татахад алдаа гарлаа: ${error}`,
      });
    }

    // Check if this FACEIT ID is already linked to another player
    const existingFaceitProfile = await PlayerProfile.findOne({
      "faceitData.faceitId": faceitData.faceitId,
      userId: { $ne: userId },
    });

    if (existingFaceitProfile) {
      return res.status(409).json({
        success: false,
        message: "Энэ FACEIT аккаунтыг аль хэдийн өөр тоглогч холбосон байна",
      });
    }

    // Update player profile with FACEIT data
    playerProfile.faceitData = faceitData;

    // Update rank based on FACEIT level if current rank is lower
    const faceitRankEquivalent = getFaceitRankEquivalent(faceitData.level);
    if (shouldUpdateRank(playerProfile.rank, faceitRankEquivalent)) {
      playerProfile.rank = faceitRankEquivalent;
    }

    await playerProfile.save();

    res.json({
      success: true,
      message: "FACEIT аккаунт амжилттай холбогдлоо",
      faceitData: {
        nickname: faceitData.nickname,
        level: faceitData.level,
        elo: faceitData.elo,
        country: faceitData.country,
        lastUpdated: faceitData.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Error linking FACEIT account:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа гарлаа",
    });
  }
});

// Unlink FACEIT account (protected endpoint)
router.delete(
  "/unlink",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const playerProfile = await PlayerProfile.findOne({ userId });
      if (!playerProfile) {
        return res.status(404).json({
          success: false,
          message: "Тоглогчийн профайл олдсонгүй",
        });
      }

      if (!playerProfile.faceitData) {
        return res.status(400).json({
          success: false,
          message: "FACEIT аккаунт холбогдоогүй байна",
        });
      }

      // Remove FACEIT data
      playerProfile.faceitData = undefined;
      await playerProfile.save();

      res.json({
        success: true,
        message: "FACEIT аккаунт амжилттай салгагдлаа",
      });
    } catch (error) {
      console.error("Error unlinking FACEIT account:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Refresh FACEIT data (protected endpoint)
router.post(
  "/refresh",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // Check if FACEIT service is enabled
      if (!faceitService.isServiceEnabled()) {
        return res.status(503).json({
          success: false,
          message:
            "FACEIT integration is currently disabled. Please contact administrator.",
        });
      }

      const userId = (req.user as any).id;

      const playerProfile = await PlayerProfile.findOne({ userId });
      if (!playerProfile) {
        return res.status(404).json({
          success: false,
          message: "Тоглогчийн профайл олдсонгүй",
        });
      }

      if (!playerProfile.faceitData?.faceitId) {
        return res.status(400).json({
          success: false,
          message: "FACEIT аккаунт холбогдоогүй байна",
        });
      }

      // Refresh FACEIT data
      let updatedFaceitData;
      try {
        updatedFaceitData = await faceitService.refreshPlayerData(
          playerProfile.faceitData.faceitId
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `FACEIT мэдээлэл шинэчлэхэд алдаа гарлаа: ${error}`,
        });
      }

      // Update player profile
      playerProfile.faceitData = {
        ...playerProfile.faceitData,
        ...updatedFaceitData,
      };

      // Update rank if FACEIT level changed
      const faceitRankEquivalent = getFaceitRankEquivalent(
        updatedFaceitData.level
      );
      if (shouldUpdateRank(playerProfile.rank, faceitRankEquivalent)) {
        playerProfile.rank = faceitRankEquivalent;
      }

      await playerProfile.save();

      res.json({
        success: true,
        message: "FACEIT мэдээлэл амжилттай шинэчлэгдлээ",
        faceitData: {
          nickname: updatedFaceitData.nickname,
          level: updatedFaceitData.level,
          elo: updatedFaceitData.elo,
          country: updatedFaceitData.country,
          gamePlayerStats: updatedFaceitData.gamePlayerStats,
          lastUpdated: updatedFaceitData.lastUpdated,
        },
      });
    } catch (error) {
      console.error("Error refreshing FACEIT data:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Get FACEIT status (protected endpoint)
router.get(
  "/status",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const playerProfile = await PlayerProfile.findOne({ userId });
      if (!playerProfile) {
        return res.status(404).json({
          success: false,
          message: "Тоглогчийн профайл олдсонгүй",
        });
      }

      const isLinked = !!playerProfile.faceitData?.faceitId;
      const needsRefresh =
        isLinked && playerProfile.faceitData?.lastUpdated
          ? faceitService.needsRefresh(playerProfile.faceitData.lastUpdated)
          : false;

      res.json({
        success: true,
        isLinked,
        needsRefresh,
        faceitData: isLinked
          ? {
              nickname: playerProfile.faceitData?.nickname,
              level: playerProfile.faceitData?.level,
              elo: playerProfile.faceitData?.elo,
              country: playerProfile.faceitData?.country,
              gamePlayerStats: playerProfile.faceitData?.gamePlayerStats,
              lastUpdated: playerProfile.faceitData?.lastUpdated,
            }
          : null,
      });
    } catch (error) {
      console.error("Error getting FACEIT status:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Verify FACEIT nickname exists (public endpoint for validation)
router.post("/verify", async (req: Request, res: Response) => {
  try {
    // Check if FACEIT service is enabled
    if (!faceitService.isServiceEnabled()) {
      return res.status(503).json({
        success: false,
        message:
          "FACEIT integration is currently disabled. Please contact administrator.",
      });
    }

    const { nickname } = req.body;

    if (!nickname || nickname.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "FACEIT nickname шаардлагатай",
      });
    }

    const exists = await faceitService.checkPlayerExists(nickname.trim());

    res.json({
      success: true,
      exists,
      message: exists ? "FACEIT аккаунт олдлоо" : "FACEIT аккаунт олдсонгүй",
    });
  } catch (error) {
    console.error("Error verifying FACEIT nickname:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа гарлаа",
    });
  }
});

// Bulk refresh FACEIT data for all linked players (admin endpoint)
router.post(
  "/bulk-refresh",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      // Check if user is admin (you can implement your own admin check)
      // For now, we'll allow any authenticated user

      const linkedProfiles = await PlayerProfile.find({
        "faceitData.faceitId": { $exists: true },
        "faceitData.isActive": true,
      });

      const results = {
        updated: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const profile of linkedProfiles) {
        try {
          if (profile.faceitData?.faceitId) {
            const updatedData = await faceitService.refreshPlayerData(
              profile.faceitData.faceitId
            );

            profile.faceitData = {
              ...profile.faceitData,
              ...updatedData,
            };

            await profile.save();
            results.updated++;
          }
        } catch (error) {
          results.failed++;
          results.errors.push(
            `${profile.faceitData?.nickname || "Unknown"}: ${error}`
          );
        }
      }

      res.json({
        success: true,
        message: "Bulk refresh completed",
        results,
      });
    } catch (error) {
      console.error("Error in bulk refresh:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Helper functions
function getFaceitRankEquivalent(faceitLevel: number): string {
  const rankMap = {
    1: "Silver",
    2: "Silver Elite",
    3: "Gold Nova",
    4: "Gold Nova Master",
    5: "Master Guardian",
    6: "Master Guardian Elite",
    7: "Distinguished Master Guardian",
    8: "Legendary Eagle",
    9: "Legendary Eagle Master",
    10: "Supreme Master First Class",
  };
  return rankMap[faceitLevel as keyof typeof rankMap] || "Silver";
}

function shouldUpdateRank(currentRank: string, faceitRank: string): boolean {
  const rankHierarchy = [
    "Silver",
    "Silver Elite",
    "Gold Nova",
    "Gold Nova Master",
    "Master Guardian",
    "Master Guardian Elite",
    "Distinguished Master Guardian",
    "Legendary Eagle",
    "Legendary Eagle Master",
    "Supreme Master First Class",
    "Global Elite",
  ];

  const currentIndex = rankHierarchy.indexOf(currentRank);
  const faceitIndex = rankHierarchy.indexOf(faceitRank);

  // Update if FACEIT rank is higher or current rank is not in hierarchy
  return currentIndex === -1 || faceitIndex > currentIndex;
}

export default router;
