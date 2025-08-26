import { Router, Request, Response } from "express";
import PlayerProfile from "../models/PlayerProfile";

const router = Router();

// GET /api/stats/overview
router.get("/stats/overview", async (req: Request, res: Response) => {
  try {
    const activePlayers = await PlayerProfile.countDocuments({
      game: "Mobile Legends",
    });

    // Placeholders until respective models exist
    const ongoingMatches = 0;
    const upcomingEvents = 0;

    res.json({ activePlayers, ongoingMatches, upcomingEvents });
  } catch (error) {
    console.error("Error fetching stats overview:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
