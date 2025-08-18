import { Router, Request, Response } from "express";
import Team, { ITeam, ITeamMember } from "../models/Team";
import User, { UserRole } from "../models/User";
import PlayerProfile from "../models/PlayerProfile";
import Notification from "../models/Notification";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Get all teams (public endpoint with pagination and filters)
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      game,
      category,
      lookingForMembers,
      search,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build filter object
    const filter: any = { isActive: true };

    if (game) {
      filter.game = game;
    }

    if (category) {
      filter.gameCategory = category;
    }

    if (lookingForMembers === "true") {
      filter.isLookingForMembers = true;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { tag: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const teams = await Team.find(filter)
      .populate("createdBy", "name avatar")
      .populate("members.userId", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Team.countDocuments(filter);

    // Transform teams data for response
    const transformedTeams = teams.map((team) => ({
      id: team._id,
      name: team.name,
      tag: team.tag,
      logo: team.logo,
      game: team.game,
      gameCategory: team.gameCategory,
      description: team.description,
      createdBy: {
        id: team.createdBy._id,
        name: team.createdBy.name,
        avatar: team.createdBy.avatar,
      },
      activeMembersCount: team.members.filter((m) => m.status === "active").length,
      maxMembers: team.maxMembers,
      isLookingForMembers: team.isLookingForMembers,
      stats: team.stats,
      createdAt: team.createdAt,
    }));

    res.json({
      success: true,
      teams: transformedTeams,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        hasNext: skip + teams.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа гарлаа",
    });
  }
});

// Get specific team details (public endpoint)
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("createdBy", "name avatar email")
      .populate("members.userId", "name avatar")
      .populate("members.invitedBy", "name");

    if (!team || !team.isActive) {
      return res.status(404).json({
        success: false,
        message: "Баг олдсонгүй",
      });
    }

    // Get detailed member information with profiles
    const memberDetails = await Promise.all(
      team.members.map(async (member) => {
        const playerProfile = await PlayerProfile.findOne({
          userId: member.userId._id,
        });
        
        return {
          id: member.userId._id,
          name: member.userId.name,
          avatar: member.userId.avatar,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
          invitedAt: member.invitedAt,
          invitedBy: member.invitedBy?.name,
          playerProfile: playerProfile ? {
            game: playerProfile.game,
            gameRole: playerProfile.role,
            rank: playerProfile.rank,
            experience: playerProfile.experience,
          } : null,
        };
      })
    );

    const transformedTeam = {
      id: team._id,
      name: team.name,
      tag: team.tag,
      logo: team.logo,
      game: team.game,
      gameCategory: team.gameCategory,
      description: team.description,
      createdBy: {
        id: team.createdBy._id,
        name: team.createdBy.name,
        avatar: team.createdBy.avatar,
        email: team.createdBy.email,
      },
      members: memberDetails,
      maxMembers: team.maxMembers,
      isLookingForMembers: team.isLookingForMembers,
      requirements: team.requirements,
      achievements: team.achievements,
      socialLinks: team.socialLinks,
      stats: team.stats,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
    };

    res.json({
      success: true,
      team: transformedTeam,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа гарлаа",
    });
  }
});

// Get user's teams (protected endpoint)
router.get(
  "/user/my-teams",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;

      const teams = await Team.find({
        "members.userId": userId,
        "members.status": { $in: ["active", "pending"] },
        isActive: true,
      })
        .populate("createdBy", "name avatar")
        .populate("members.userId", "name avatar")
        .sort({ createdAt: -1 });

      const transformedTeams = teams.map((team) => {
        const userMember = team.members.find(
          (member) => member.userId._id.toString() === userId
        );

        return {
          id: team._id,
          name: team.name,
          tag: team.tag,
          logo: team.logo,
          game: team.game,
          gameCategory: team.gameCategory,
          description: team.description,
          userRole: userMember?.role,
          userStatus: userMember?.status,
          activeMembersCount: team.members.filter((m) => m.status === "active").length,
          maxMembers: team.maxMembers,
          isLookingForMembers: team.isLookingForMembers,
          stats: team.stats,
          createdAt: team.createdAt,
        };
      });

      res.json({
        success: true,
        teams: transformedTeams,
      });
    } catch (error) {
      console.error("Error fetching user teams:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Create team (protected endpoint)
router.post(
  "/create",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const {
        name,
        tag,
        logo,
        logoPublicId,
        game,
        gameCategory,
        description,
        maxMembers = 5,
        requirements,
        socialLinks,
      } = req.body;

      // Check if user is a player
      const user = await User.findById(userId);
      if (!user || user.role !== UserRole.PLAYER) {
        return res.status(403).json({
          success: false,
          message: "Зөвхөн тоглогчид баг үүсгэх боломжтой",
        });
      }

      // Validate required fields
      if (!name || !tag || !game || !gameCategory) {
        return res.status(400).json({
          success: false,
          message: "Багийн нэр, TAG, тоглоом болон категори шаардлагатай",
        });
      }

      // Check if tag is already taken
      const existingTeam = await Team.findOne({ tag: tag.toUpperCase() });
      if (existingTeam) {
        return res.status(409).json({
          success: false,
          message: "Энэ TAG-г аль хэдийн ашиглаж байна",
        });
      }

      // Check if user is already leading a team for this game
      const existingLeaderTeam = await Team.findOne({
        game,
        "members.userId": userId,
        "members.role": "leader",
        "members.status": "active",
        isActive: true,
      });

      if (existingLeaderTeam) {
        return res.status(409).json({
          success: false,
          message: "Та энэ тоглоомд аль хэдийн багт удирдагчаар байна",
        });
      }

      // Create new team
      const newTeam = new Team({
        name: name.trim(),
        tag: tag.trim().toUpperCase(),
        logo,
        logoPublicId,
        game,
        gameCategory,
        description: description?.trim(),
        createdBy: userId,
        maxMembers: Math.max(2, Math.min(10, maxMembers)),
        requirements,
        socialLinks,
        members: [
          {
            userId,
            role: "leader",
            status: "active",
            joinedAt: new Date(),
            invitedAt: new Date(),
            invitedBy: userId,
          },
        ],
      });

      await newTeam.save();

      // Populate team data for response
      await newTeam.populate("createdBy", "name avatar");
      await newTeam.populate("members.userId", "name avatar");

      const transformedTeam = {
        id: newTeam._id,
        name: newTeam.name,
        tag: newTeam.tag,
        logo: newTeam.logo,
        game: newTeam.game,
        gameCategory: newTeam.gameCategory,
        description: newTeam.description,
        createdBy: {
          id: newTeam.createdBy._id,
          name: newTeam.createdBy.name,
          avatar: newTeam.createdBy.avatar,
        },
        members: newTeam.members.map((member) => ({
          id: member.userId._id,
          name: member.userId.name,
          avatar: member.userId.avatar,
          role: member.role,
          status: member.status,
          joinedAt: member.joinedAt,
        })),
        maxMembers: newTeam.maxMembers,
        isLookingForMembers: newTeam.isLookingForMembers,
        requirements: newTeam.requirements,
        socialLinks: newTeam.socialLinks,
        stats: newTeam.stats,
        createdAt: newTeam.createdAt,
      };

      res.status(201).json({
        success: true,
        message: "Баг амжилттай үүслээ",
        team: transformedTeam,
      });
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Update team (protected endpoint)
router.put(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const teamId = req.params.id;
      const updateData = req.body;

      const team = await Team.findById(teamId);
      if (!team || !team.isActive) {
        return res.status(404).json({
          success: false,
          message: "Баг олдсонгүй",
        });
      }

      // Check if user is team leader
      if (!team.isLeader(userId)) {
        return res.status(403).json({
          success: false,
          message: "Зөвхөн багийн удирдагч мэдээлэл засварлах боломжтой",
        });
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.createdBy;
      delete updateData.members;
      delete updateData.stats;

      // If tag is being updated, check if it's available
      if (updateData.tag && updateData.tag !== team.tag) {
        const existingTeam = await Team.findOne({
          tag: updateData.tag.toUpperCase(),
          _id: { $ne: teamId },
        });
        if (existingTeam) {
          return res.status(409).json({
            success: false,
            message: "Энэ TAG-г аль хэдийн ашиглаж байна",
          });
        }
        updateData.tag = updateData.tag.toUpperCase();
      }

      const updatedTeam = await Team.findByIdAndUpdate(teamId, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("createdBy", "name avatar")
        .populate("members.userId", "name avatar");

      res.json({
        success: true,
        message: "Багийн мэдээлэл амжилттай шинэчлэгдлээ",
        team: updatedTeam,
      });
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Invite player to team (protected endpoint)
router.post(
  "/:id/invite",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const teamId = req.params.id;
      const { playerId } = req.body;

      if (!playerId) {
        return res.status(400).json({
          success: false,
          message: "Тоглогчийн ID шаардлагатай",
        });
      }

      const team = await Team.findById(teamId);
      if (!team || !team.isActive) {
        return res.status(404).json({
          success: false,
          message: "Баг олдсонгүй",
        });
      }

      // Check if user can invite (is team leader or member with permission)
      if (!team.isLeader(userId)) {
        return res.status(403).json({
          success: false,
          message: "Зөвхөн багийн удирдагч тоглогч урих боломжтой",
        });
      }

      // Check if team is full
      const activeMembers = team.members.filter((m) => m.status === "active");
      if (activeMembers.length >= team.maxMembers) {
        return res.status(400).json({
          success: false,
          message: "Баг дүүрсэн байна",
        });
      }

      // Check if player exists and is a player
      const player = await User.findById(playerId);
      if (!player || player.role !== UserRole.PLAYER) {
        return res.status(404).json({
          success: false,
          message: "Тоглогч олдсонгүй",
        });
      }

      // Check if player is already in the team
      const existingMember = team.members.find(
        (member) => member.userId.toString() === playerId
      );

      if (existingMember) {
        if (existingMember.status === "active") {
          return res.status(409).json({
            success: false,
            message: "Тоглогч аль хэдийн багт байна",
          });
        } else if (existingMember.status === "pending") {
          return res.status(409).json({
            success: false,
            message: "Тоглогчид аль хэдийн урилга илгээсэн байна",
          });
        }
      }

      // Check if player is already in another active team for this game
      const playerActiveTeam = await Team.findOne({
        game: team.game,
        "members.userId": playerId,
        "members.status": "active",
        isActive: true,
      });

      if (playerActiveTeam) {
        return res.status(409).json({
          success: false,
          message: "Тоглогч энэ тоглоомд өөр багт идэвхтэй байна",
        });
      }

      // Add invitation
      if (existingMember && existingMember.status === "declined") {
        // Update existing declined invitation
        existingMember.status = "pending";
        existingMember.invitedAt = new Date();
        existingMember.invitedBy = userId;
      } else {
        // Add new invitation
        team.members.push({
          userId: playerId,
          role: "member",
          status: "pending",
          invitedAt: new Date(),
          invitedBy: userId,
        } as ITeamMember);
      }

      await team.save();

      // Create notification for the invited player
      await Notification.create({
        userId: playerId,
        type: "team_invitation",
        title: "Багийн урилга",
        message: `Таныг "${team.name}" багт урилаа`,
        data: {
          teamId: team._id,
          teamName: team.name,
          teamTag: team.tag,
          invitedBy: userId,
        },
      });

      res.json({
        success: true,
        message: "Тоглогчид урилга амжилттай илгээлээ",
      });
    } catch (error) {
      console.error("Error inviting player:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Respond to team invitation (protected endpoint)
router.post(
  "/:id/respond",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const teamId = req.params.id;
      const { action } = req.body; // "accept" or "decline"

      if (!action || !["accept", "decline"].includes(action)) {
        return res.status(400).json({
          success: false,
          message: "Зөв үйлдэл сонгоно уу (accept эсвэл decline)",
        });
      }

      const team = await Team.findById(teamId);
      if (!team || !team.isActive) {
        return res.status(404).json({
          success: false,
          message: "Баг олдсонгүй",
        });
      }

      // Find the user's invitation
      const memberIndex = team.members.findIndex(
        (member) =>
          member.userId.toString() === userId && member.status === "pending"
      );

      if (memberIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Урилга олдсонгүй",
        });
      }

      if (action === "accept") {
        // Check if team is full
        const activeMembers = team.members.filter((m) => m.status === "active");
        if (activeMembers.length >= team.maxMembers) {
          return res.status(400).json({
            success: false,
            message: "Баг дүүрсэн байна",
          });
        }

        // Check if player is already in another active team for this game
        const playerActiveTeam = await Team.findOne({
          game: team.game,
          "members.userId": userId,
          "members.status": "active",
          isActive: true,
          _id: { $ne: teamId },
        });

        if (playerActiveTeam) {
          return res.status(409).json({
            success: false,
            message: "Та энэ тоглоомд өөр багт идэвхтэй байна",
          });
        }

        // Accept invitation
        team.members[memberIndex].status = "active";
        team.members[memberIndex].joinedAt = new Date();

        // Create notification for team leader
        await Notification.create({
          userId: team.createdBy,
          type: "team_member_joined",
          title: "Шинэ гишүүн нэгдлээ",
          message: `Тоглогч таны "${team.name}" багт нэгдлээ`,
          data: {
            teamId: team._id,
            teamName: team.name,
            newMemberId: userId,
          },
        });
      } else {
        // Decline invitation
        team.members[memberIndex].status = "declined";
      }

      await team.save();

      const actionText = action === "accept" ? "хүлээн авлаа" : "татгалзлаа";
      res.json({
        success: true,
        message: `Багийн урилгыг амжилттай ${actionText}`,
      });
    } catch (error) {
      console.error("Error responding to invitation:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Remove member from team (protected endpoint)
router.delete(
  "/:id/members/:memberId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const teamId = req.params.id;
      const memberId = req.params.memberId;

      const team = await Team.findById(teamId);
      if (!team || !team.isActive) {
        return res.status(404).json({
          success: false,
          message: "Баг олдсонгүй",
        });
      }

      // Check if user is team leader or removing themselves
      const isLeader = team.isLeader(userId);
      const isRemovingSelf = userId === memberId;

      if (!isLeader && !isRemovingSelf) {
        return res.status(403).json({
          success: false,
          message: "Зөвхөн багийн удирдагч эсвэл өөрийгөө хасах боломжтой",
        });
      }

      // Find the member to remove
      const memberIndex = team.members.findIndex(
        (member) =>
          member.userId.toString() === memberId &&
          ["active", "pending"].includes(member.status)
      );

      if (memberIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Багийн гишүүн олдсонгүй",
        });
      }

      const memberToRemove = team.members[memberIndex];

      // Prevent leader from being removed by others
      if (memberToRemove.role === "leader" && !isRemovingSelf) {
        return res.status(403).json({
          success: false,
          message: "Багийн удирдагчийг хасах боломжгүй",
        });
      }

      // If leader is leaving, check if there are other active members to promote
      if (isRemovingSelf && memberToRemove.role === "leader") {
        const otherActiveMembers = team.members.filter(
          (member) =>
            member.userId.toString() !== memberId &&
            member.status === "active"
        );

        if (otherActiveMembers.length > 0) {
          // Promote the first active member to leader
          const newLeaderIndex = team.members.findIndex(
            (member) => member.userId.toString() === otherActiveMembers[0].userId.toString()
          );
          team.members[newLeaderIndex].role = "leader";

          // Create notification for new leader
          await Notification.create({
            userId: otherActiveMembers[0].userId,
            type: "team_leadership_transferred",
            title: "Багийн удирдагч болсон",
            message: `Та "${team.name}" багийн шинэ удирдагч боллоо`,
            data: {
              teamId: team._id,
              teamName: team.name,
            },
          });
        }
      }

      // Remove or mark member as removed
      team.members[memberIndex].status = "removed";

      await team.save();

      // Create notification for the removed member (if not removing self)
      if (!isRemovingSelf) {
        await Notification.create({
          userId: memberId,
          type: "team_member_removed",
          title: "Багаас хасагдлаа",
          message: `Таныг "${team.name}" багаас хаслаа`,
          data: {
            teamId: team._id,
            teamName: team.name,
          },
        });
      }

      const actionText = isRemovingSelf ? "гарлаа" : "хасагдлаа";
      res.json({
        success: true,
        message: `Гишүүн багаас амжилттай ${actionText}`,
      });
    } catch (error) {
      console.error("Error removing team member:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

// Delete team (protected endpoint)
router.delete(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const teamId = req.params.id;

      const team = await Team.findById(teamId);
      if (!team || !team.isActive) {
        return res.status(404).json({
          success: false,
          message: "Баг олдсонгүй",
        });
      }

      // Check if user is team leader
      if (!team.isLeader(userId)) {
        return res.status(403).json({
          success: false,
          message: "Зөвхөн багийн удирдагч багийг устгах боломжтой",
        });
      }

      // Mark team as inactive instead of deleting
      team.isActive = false;
      await team.save();

      // Create notifications for all active members
      const activeMembers = team.members.filter(
        (member) => member.status === "active" && member.userId.toString() !== userId
      );

      for (const member of activeMembers) {
        await Notification.create({
          userId: member.userId,
          type: "team_disbanded",
          title: "Баг татан буугдлаа",
          message: `"${team.name}" багийг татан буулгалаа`,
          data: {
            teamId: team._id,
            teamName: team.name,
          },
        });
      }

      res.json({
        success: true,
        message: "Баг амжилттай устгагдлаа",
      });
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({
        success: false,
        message: "Серверийн алдаа гарлаа",
      });
    }
  }
);

export default router;
