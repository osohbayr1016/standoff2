import { Router, Request, Response, NextFunction } from "express";
import User, { UserRole } from "../models/User";
import { authenticateToken, optionalAuth } from "../middleware/auth";

const router = Router();

// Get all players (public endpoint)
router.get("/players", async (req: Request, res: Response) => {
  try {
    const players = await User.find({ role: UserRole.PLAYER })
      .select("id name email avatar role isVerified isOnline")
      .lean();

    // Transform data to match frontend expectations
    const transformedPlayers = players.map((player) => ({
      id: player.id,
      name: player.name,
      avatar:
        player.avatar ||
        `https://images.unsplash.com/photo-${Math.floor(
          Math.random() * 1000000
        )}?w=150&h=150&fit=crop&crop=face`,
      game: getRandomGame(),
      role: getRandomRole(),
      rank: getRandomRank(),
      experience: `${Math.floor(Math.random() * 10) + 1}+ years`,
      description: getRandomDescription(player.name || "Player"),
      isOnline: Math.random() > 0.3, // 70% chance of being online
      isLookingForTeam: Math.random() > 0.4, // 60% chance of looking for team
    }));

    res.json({ players: transformedPlayers });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user profile (requires authentication)
router.get(
  "/profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const user = await User.findById(userId)
        .select(
          "id email name avatar bio gameExpertise hourlyRate rating totalReviews isVerified isOnline lastSeen role createdAt updatedAt"
        )
        .lean();

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({ user });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update user profile (requires authentication)
router.put(
  "/profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const { name, avatar, bio, gameExpertise, hourlyRate } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;
      if (bio) updateData.bio = bio;
      if (gameExpertise) updateData.gameExpertise = gameExpertise;
      if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        select:
          "id email name avatar bio gameExpertise hourlyRate rating totalReviews isVerified isOnline lastSeen role createdAt updatedAt",
      });

      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Helper functions for mock data
function getRandomGame(): string {
  const games = [
    "Dota 2",
    "CS:GO",
    "League of Legends",
    "Valorant",
    "Overwatch",
  ];
  return games[Math.floor(Math.random() * games.length)];
}

function getRandomRole(): string {
  const roles = [
    "Carry",
    "Support",
    "Mid",
    "AWPer",
    "IGL",
    "Duelist",
    "Controller",
  ];
  return roles[Math.floor(Math.random() * roles.length)];
}

function getRandomRank(): string {
  const ranks = [
    "Divine",
    "Ancient",
    "Legend",
    "Global Elite",
    "Supreme",
    "Diamond",
    "Immortal",
  ];
  return ranks[Math.floor(Math.random() * ranks.length)];
}

function getRandomDescription(name: string): string {
  const descriptions = [
    `${name} is a professional player looking for competitive opportunities`,
    `Skilled ${name} with excellent game sense and teamwork`,
    `${name} brings years of experience and strategic thinking`,
    `Aggressive player ${name} with strong mechanical skills`,
    `${name} is known for excellent communication and leadership`,
    `Experienced ${name} with strong map awareness and positioning`,
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

export default router;
