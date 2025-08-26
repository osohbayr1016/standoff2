import { Router, Request, Response } from "express";
import PlayerProfile from "../models/PlayerProfile";
import User, { UserRole } from "../models/User";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Get all player profiles (public endpoint)
router.get("/profiles", async (req: Request, res: Response) => {
  try {
    const profiles = await PlayerProfile.find({ game: "Mobile Legends" })
      .populate("userId", "name avatar email")
      .lean();

    const transformedProfiles = profiles.map((profile: any) => ({
      id: profile.userId._id,
      name: profile.userId.name,
      avatar: profile.avatar || profile.userId.avatar || "/default-avatar.png",
      avatarPublicId: profile.avatarPublicId,
      category: profile.category,
      game: profile.game,
      role: profile.role,
      inGameName: profile.inGameName,
      rank: profile.rank,
      experience: profile.experience,
      bio: profile.bio,
      socialLinks: profile.socialLinks,
      highlightVideo: profile.highlightVideo,
      isLookingForTeam: profile.isLookingForTeam,
      achievements: profile.achievements,
      preferredRoles: profile.preferredRoles,
      availability: profile.availability,
      languages: profile.languages,
    }));

    res.json({ profiles: transformedProfiles });
  } catch (error) {
    console.error("Error fetching player profiles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get specific player profile (public endpoint)
router.get("/profiles/:id", async (req: Request, res: Response) => {
  try {
    const profile = await PlayerProfile.findOne({ userId: req.params.id })
      .populate("userId", "name avatar email")
      .lean();

    if (!profile) {
      return res.status(404).json({ message: "Player profile not found" });
    }

    const transformedProfile = {
      id: (profile as any).userId._id,
      name: (profile as any).userId.name,
      avatar:
        profile.avatar ||
        (profile as any).userId.avatar ||
        "/default-avatar.png",
      avatarPublicId: profile.avatarPublicId,
      category: profile.category,
      game: profile.game,
      role: profile.role,
      inGameName: profile.inGameName,
      rank: profile.rank,
      experience: profile.experience,
      bio: profile.bio,
      socialLinks: profile.socialLinks,
      highlightVideo: profile.highlightVideo,
      isLookingForTeam: profile.isLookingForTeam,
      achievements: profile.achievements,
      preferredRoles: profile.preferredRoles,
      availability: profile.availability,
      languages: profile.languages,
    };

    res.json({ profile: transformedProfile });
  } catch (error) {
    console.error("Error fetching player profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user's profile (requires authentication)
router.get(
  "/my-profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      // Check if user is a player
      const user = await User.findById(userId);
      if (!user || user.role !== UserRole.PLAYER) {
        return res
          .status(403)
          .json({ message: "Only players can access this endpoint" });
      }

      const profile = await PlayerProfile.findOne({ userId })
        .populate("userId", "name avatar email")
        .lean();

      if (!profile) {
        return res.status(404).json({
          message: "Profile not found. Please create your profile first.",
        });
      }

      const transformedProfile = {
        id: (profile as any).userId._id,
        name: (profile as any).userId.name,
        avatar:
          profile.avatar ||
          (profile as any).userId.avatar ||
          "/default-avatar.png",
        avatarPublicId: profile.avatarPublicId,
        category: profile.category,
        game: profile.game,
        role: profile.role,
        inGameName: profile.inGameName,
        rank: profile.rank,
        experience: profile.experience,
        bio: profile.bio,
        socialLinks: profile.socialLinks,
        highlightVideo: profile.highlightVideo,
        isLookingForTeam: profile.isLookingForTeam,
        achievements: profile.achievements,
        preferredRoles: profile.preferredRoles,
        availability: profile.availability,
        languages: profile.languages,
      };

      res.json({ profile: transformedProfile });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Create player profile (requires authentication)
router.post(
  "/create-profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      // Check if user is a player
      const user = await User.findById(userId);
      if (!user || user.role !== UserRole.PLAYER) {
        return res
          .status(403)
          .json({ message: "Only players can create profiles" });
      }

      // Check if profile already exists
      const existingProfile = await PlayerProfile.findOne({ userId });
      if (existingProfile) {
        return res.status(400).json({
          message: "Profile already exists. Use update endpoint instead.",
        });
      }

      const {
        role,
        inGameName,
        rank,
        experience,
        bio,
        avatar,
        avatarPublicId,
        socialLinks,
        highlightVideo,
        isLookingForTeam,
        achievements,
        preferredRoles,
        availability,
        languages,
      } = req.body;

      // Debug: Log the received data
      console.log("🔍 Debug - Create profile request body:", req.body);
      console.log("🔍 Debug - Avatar URL received:", avatar);
      console.log("🔍 Debug - Avatar Public ID received:", avatarPublicId);

      // Validate required fields
      if (!role || !inGameName || !rank || !experience || !bio) {
        return res.status(400).json({
          message:
            "Missing required fields: role, inGameName, rank, experience, bio",
        });
      }

      const newProfile = new PlayerProfile({
        userId,
        category: "Mobile",
        game: "Mobile Legends",
        role,
        inGameName,
        rank,
        experience,
        bio,
        avatar,
        avatarPublicId,
        socialLinks: socialLinks || {},
        highlightVideo,
        isLookingForTeam:
          isLookingForTeam !== undefined ? isLookingForTeam : true,
        achievements: achievements || [],
        preferredRoles: preferredRoles || [role],
        availability: availability || {
          weekdays: true,
          weekends: true,
          timezone: "Asia/Ulaanbaatar",
          preferredHours: "18:00-22:00",
        },
        languages: languages || ["Mongolian"],
      });

      // Debug: Log the profile object before saving
      console.log("🔍 Debug - Profile object before saving:", {
        avatar: newProfile.avatar,
        avatarPublicId: newProfile.avatarPublicId,
      });

      await newProfile.save();

      // Debug: Log the saved profile
      console.log("🔍 Debug - Profile saved successfully:", {
        avatar: newProfile.avatar,
        avatarPublicId: newProfile.avatarPublicId,
      });

      // Populate user data for response
      await newProfile.populate("userId", "name avatar email");

      const transformedProfile = {
        id: (newProfile as any).userId._id,
        name: (newProfile as any).userId.name,
        avatar:
          newProfile.avatar ||
          (newProfile as any).userId.avatar ||
          "/default-avatar.png",
        avatarPublicId: newProfile.avatarPublicId,
        category: newProfile.category,
        game: newProfile.game,
        role: newProfile.role,
        inGameName: newProfile.inGameName,
        rank: newProfile.rank,
        experience: newProfile.experience,
        bio: newProfile.bio,
        socialLinks: newProfile.socialLinks,
        highlightVideo: newProfile.highlightVideo,
        isLookingForTeam: newProfile.isLookingForTeam,
        achievements: newProfile.achievements,
        preferredRoles: newProfile.preferredRoles,
        availability: newProfile.availability,
        languages: newProfile.languages,
      };

      res.status(201).json({
        message: "Profile created successfully",
        profile: transformedProfile,
      });
    } catch (error) {
      console.error("Error creating player profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update player profile (requires authentication)
router.put(
  "/update-profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      // Check if user is a player
      const user = await User.findById(userId);
      if (!user || user.role !== UserRole.PLAYER) {
        return res
          .status(403)
          .json({ message: "Only players can update profiles" });
      }

      const profile = await PlayerProfile.findOne({ userId });
      if (!profile) {
        return res.status(404).json({
          message: "Profile not found. Please create your profile first.",
        });
      }

      const updateData = req.body;

      console.log("🔍 Debug - Update request body:", req.body);
      console.log(
        "🔍 Debug - Highlight video in request:",
        req.body.highlightVideo
      );

      // Remove userId from update data to prevent unauthorized changes
      delete updateData.userId;

      const updatedProfile = await PlayerProfile.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, runValidators: true }
      ).populate("userId", "name avatar email");

      console.log(
        "🔍 Debug - Updated profile highlight video:",
        updatedProfile?.highlightVideo
      );

      const transformedProfile = {
        id: (updatedProfile as any).userId._id,
        name: (updatedProfile as any).userId.name,
        avatar:
          updatedProfile.avatar ||
          (updatedProfile as any).userId.avatar ||
          "/default-avatar.png",
        avatarPublicId: updatedProfile.avatarPublicId,
        category: updatedProfile.category,
        game: updatedProfile.game,
        role: updatedProfile.role,
        inGameName: updatedProfile.inGameName,
        rank: updatedProfile.rank,
        experience: updatedProfile.experience,
        bio: updatedProfile.bio,
        socialLinks: updatedProfile.socialLinks,
        highlightVideo: updatedProfile.highlightVideo,
        isLookingForTeam: updatedProfile.isLookingForTeam,
        achievements: updatedProfile.achievements,
        preferredRoles: updatedProfile.preferredRoles,
        availability: updatedProfile.availability,
        languages: updatedProfile.languages,
      };

      res.json({
        message: "Profile updated successfully",
        profile: transformedProfile,
      });
    } catch (error) {
      console.error("Error updating player profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Check if user has profile (requires authentication)
router.get(
  "/has-profile",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const profile = await PlayerProfile.findOne({ userId });

      res.json({
        hasProfile: !!profile,
        profileId: profile?._id,
      });
    } catch (error) {
      console.error("Error checking profile existence:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
