import express from "express";
import { authenticateToken } from "../middleware/auth";
import Clan from "../models/Clan";
import User from "../models/User";
import PlayerProfile from "../models/PlayerProfile";

const router = express.Router();

// Get all clans
router.get("/", async (req, res) => {
  try {
    const clans = await Clan.find()
      .populate("leader", "name avatar")
      .select("-members")
      .sort({ createdAt: -1 });

    res.json({ clans });
  } catch (error) {
    console.error("Error fetching clans:", error);
    res.status(500).json({ error: "Failed to fetch clans" });
  }
});

// Get clan by ID
router.get("/:id", async (req, res) => {
  try {
    const clan = await Clan.findById(req.params.id).populate(
      "leader",
      "name avatar email"
    );

    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    res.json({ clan });
  } catch (error) {
    console.error("Error fetching clan:", error);
    res.status(500).json({ error: "Failed to fetch clan" });
  }
});

// Create new clan
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, tag, description } = req.body;
    const userId = (req.user as any).id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Check if user already has a clan
    const existingClan = await Clan.findOne({
      $or: [
        { leader: userId },
        { "members.id": userId, "members.status": "accepted" },
      ],
    });

    if (existingClan) {
      return res.status(400).json({
        error: "You are already a member or leader of a clan",
      });
    }

    // Check if tag is already taken
    const existingTag = await Clan.findOne({ tag: tag.toUpperCase() });
    if (existingTag) {
      return res.status(400).json({ error: "Clan tag already exists" });
    }

    // Get user profile
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create clan with leader as first member
    const clan = new Clan({
      name,
      tag: tag.toUpperCase(),
      description,
      leader: userId,
      members: [
        {
          id: userId,
          name: user.name,
          avatar: user.avatar || "/default-avatar.png",
          status: "accepted",
          invitedAt: new Date().toISOString(),
          joinedAt: new Date().toISOString(),
        },
      ],
      maxMembers: 10, // Free plan limit
      isPremium: false,
    });

    await clan.save();

    // Populate leader info
    await clan.populate("leader", "name avatar email");

    res.status(201).json({ clan });
  } catch (error) {
    console.error("Error creating clan:", error);
    res.status(500).json({ error: "Failed to create clan" });
  }
});

// Update clan
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { name, description, logo } = req.body;
    const userId = (req.user as any).id;
    const clanId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const clan = await Clan.findById(clanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Check if user is clan leader
    if (clan.leader !== userId) {
      return res
        .status(403)
        .json({ error: "Only clan leader can update clan" });
    }

    // Update clan
    clan.name = name || clan.name;
    clan.description = description || clan.description;
    clan.logo = logo || clan.logo;

    await clan.save();
    await clan.populate("leader", "name avatar email");

    res.json({ clan });
  } catch (error) {
    console.error("Error updating clan:", error);
    res.status(500).json({ error: "Failed to update clan" });
  }
});

// Invite player to clan
router.post("/:id/invite", authenticateToken, async (req, res) => {
  try {
    const { playerId } = req.body;
    const userId = (req.user as any).id;
    const clanId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const clan = await Clan.findById(clanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Check if user is clan leader
    if (clan.leader !== userId) {
      return res
        .status(403)
        .json({ error: "Only clan leader can invite players" });
    }

    // Check if clan is full
    const acceptedMembers = clan.members.filter((m) => m.status === "accepted");
    if (acceptedMembers.length >= clan.maxMembers) {
      return res.status(400).json({ error: "Clan is full" });
    }

    // Check if player is already in clan
    const existingMember = clan.members.find((m) => m.id === playerId);
    if (existingMember) {
      return res.status(400).json({ error: "Player is already in clan" });
    }

    // Get player profile and user
    const playerProfile = await PlayerProfile.findOne({ userId: playerId });
    if (!playerProfile) {
      return res.status(404).json({ error: "Player profile not found" });
    }

    const user = await User.findById(playerId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if player is in another clan
    const playerInOtherClan = await Clan.findOne({
      "members.id": playerId,
      "members.status": "accepted",
    });

    if (playerInOtherClan) {
      return res
        .status(400)
        .json({ error: "Player is already in another clan" });
    }

    // Add player to clan
    clan.members.push({
      id: playerId,
      name: user.name,
      avatar: playerProfile.avatar || "/default-avatar.png",
      status: "pending",
      invitedAt: new Date().toISOString(),
    });

    await clan.save();

    res.json({
      message: "Invitation sent successfully",
      clan,
    });
  } catch (error) {
    console.error("Error inviting player:", error);
    res.status(500).json({ error: "Failed to invite player" });
  }
});

// Accept clan invitation
router.post("/:id/accept", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const clanId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const clan = await Clan.findById(clanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Find member invitation
    const member = clan.members.find((m) => m.id === userId);
    if (!member) {
      return res.status(404).json({ error: "No invitation found" });
    }

    if (member.status !== "pending") {
      return res.status(400).json({ error: "Invitation already processed" });
    }

    // Check if clan is full
    const acceptedMembers = clan.members.filter((m) => m.status === "accepted");
    if (acceptedMembers.length >= clan.maxMembers) {
      return res.status(400).json({ error: "Clan is full" });
    }

    // Accept invitation
    member.status = "accepted";
    member.joinedAt = new Date().toISOString();

    await clan.save();
    await clan.populate("leader", "name avatar email");

    res.json({
      message: "Invitation accepted successfully",
      clan,
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ error: "Failed to accept invitation" });
  }
});

// Decline clan invitation
router.post("/:id/decline", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const clanId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const clan = await Clan.findById(clanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Find member invitation
    const member = clan.members.find((m) => m.id === userId);
    if (!member) {
      return res.status(404).json({ error: "No invitation found" });
    }

    if (member.status !== "pending") {
      return res.status(400).json({ error: "Invitation already processed" });
    }

    // Decline invitation
    member.status = "declined";

    await clan.save();

    res.json({
      message: "Invitation declined successfully",
      clan,
    });
  } catch (error) {
    console.error("Error declining invitation:", error);
    res.status(500).json({ error: "Failed to decline invitation" });
  }
});

// Leave clan
router.post("/:id/leave", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const clanId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const clan = await Clan.findById(clanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Check if user is leader
    if (clan.leader === userId) {
      return res.status(400).json({
        error: "Clan leader cannot leave. Transfer leadership or delete clan.",
      });
    }

    // Find member
    const memberIndex = clan.members.findIndex((m) => m.id === userId);
    if (memberIndex === -1) {
      return res.status(404).json({ error: "Not a member of this clan" });
    }

    // Remove member
    clan.members.splice(memberIndex, 1);
    await clan.save();

    res.json({
      message: "Left clan successfully",
      clan,
    });
  } catch (error) {
    console.error("Error leaving clan:", error);
    res.status(500).json({ error: "Failed to leave clan" });
  }
});

// Remove member from clan (leader only)
router.delete("/:id/members/:memberId", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const clanId = req.params.id;
    const memberId = req.params.memberId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const clan = await Clan.findById(clanId);
    if (!clan) {
      return res.status(404).json({ error: "Clan not found" });
    }

    // Check if user is clan leader
    if (clan.leader !== userId) {
      return res
        .status(403)
        .json({ error: "Only clan leader can remove members" });
    }

    // Find member
    const memberIndex = clan.members.findIndex((m) => m.id === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Remove member
    clan.members.splice(memberIndex, 1);
    await clan.save();

    res.json({
      message: "Member removed successfully",
      clan,
    });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// Get user's clan
router.get("/user/me", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const clan = await Clan.findOne({
      $or: [
        { leader: userId },
        { "members.id": userId, "members.status": "accepted" },
      ],
    }).populate("leader", "name avatar email");

    res.json({ clan });
  } catch (error) {
    console.error("Error fetching user's clan:", error);
    res.status(500).json({ error: "Failed to fetch user's clan" });
  }
});

// Get user's clan invitations
router.get("/user/invitations", authenticateToken, async (req, res) => {
  try {
    const userId = (req.user as any).id;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const clans = await Clan.find({
      "members.id": userId,
      "members.status": "pending",
    }).populate("leader", "name avatar email");

    res.json({ invitations: clans });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
});

export default router;
