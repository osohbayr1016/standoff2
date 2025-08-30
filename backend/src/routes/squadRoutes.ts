import { FastifyInstance, FastifyPluginAsync } from "fastify";
import Squad from "../models/Squad";
import User from "../models/User";
import SquadInvitation from "../models/SquadInvitation";
import SquadApplication from "../models/SquadApplication";
import { SquadJoinType } from "../models/Squad";
import { InvitationStatus } from "../models/SquadInvitation";
import { ApplicationStatus } from "../models/SquadApplication";

const squadRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Health check
  fastify.get("/health", async (request, reply) => {
    return reply.send({
      success: true,
      message: "Squad routes available",
      timestamp: new Date().toISOString(),
    });
  });

  // Get all squads with pagination and filtering
  fastify.get("/", async (request, reply) => {
    try {
      const {
        page = 1,
        limit = 10,
        game,
        leader,
        isActive,
        search,
        joinType,
      } = request.query as any;

      const query: any = {};

      // Apply filters
      if (game && game !== "All") {
        query.game = game;
      }

      if (leader) {
        query.leader = leader;
      }

      if (isActive !== undefined) {
        query.isActive = isActive === "true";
      }

      if (joinType && joinType !== "All") {
        query.joinType = joinType;
      }

      if (search) {
        query.$text = { $search: search };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [squads, total] = await Promise.all([
        Squad.find(query)
          .populate("leader", "name email avatar")
          .populate("members", "name email avatar")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Squad.countDocuments(query),
      ]);

      return reply.status(200).send({
        success: true,
        squads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get squads error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get squads",
      });
    }
  });

  // Get squad by ID
  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const squad = await Squad.findById(id)
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      return reply.status(200).send({
        success: true,
        squad,
      });
    } catch (error) {
      console.error("Get squad by ID error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get squad",
      });
    }
  });

  // Create squad
  fastify.post("/", async (request, reply) => {
    try {
      const squadData = request.body as any;

      // Validate required fields
      const requiredFields = ["name", "tag", "leader", "game", "maxMembers"];
      const missingFields = requiredFields.filter((field) => !squadData[field]);

      if (missingFields.length > 0) {
        return reply.status(400).send({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          missingFields,
        });
      }

      // Validate maxMembers
      if (squadData.maxMembers < 5 || squadData.maxMembers > 7) {
        return reply.status(400).send({
          success: false,
          message: "Squad must have between 5 and 7 members",
        });
      }

      // Validate game is Mobile Legends only
      if (squadData.game !== "Mobile Legends: Bang Bang") {
        return reply.status(400).send({
          success: false,
          message: "Squads can only be created for Mobile Legends: Bang Bang",
        });
      }

      // Check if tag is unique
      const existingSquad = await Squad.findOne({ tag: squadData.tag });
      if (existingSquad) {
        return reply.status(400).send({
          success: false,
          message: "Squad tag already exists",
        });
      }

      // Verify leader exists
      const leader = await User.findById(squadData.leader);
      if (!leader) {
        return reply.status(400).send({
          success: false,
          message: "Leader not found",
        });
      }

      // Initialize members array with leader
      squadData.members = [squadData.leader];

      const newSquad = new Squad(squadData);
      await newSquad.save();

      const populatedSquad = await Squad.findById(newSquad._id)
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      return reply.status(201).send({
        success: true,
        message: "Squad created successfully",
        squad: populatedSquad,
      });
    } catch (error) {
      console.error("Create squad error:", error);

      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err: any) => err.message
        );
        return reply.status(400).send({
          success: false,
          message: "Validation failed",
          errors: validationErrors,
        });
      }

      return reply.status(500).send({
        success: false,
        message: "Failed to create squad",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  // Update squad (leader only)
  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const updateData = request.body as any;
      const { userId } = request.body as any; // Current user ID

      const squad = await Squad.findById(id);

      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      // Only leader can update squad
      if (squad.leader.toString() !== userId) {
        return reply.status(403).send({
          success: false,
          message: "Only squad leader can update squad",
        });
      }

      // Prevent updating tag if it already exists
      if (updateData.tag && updateData.tag !== squad.tag) {
        const existingSquad = await Squad.findOne({ tag: updateData.tag });
        if (existingSquad) {
          return reply.status(400).send({
            success: false,
            message: "Squad tag already exists",
          });
        }
      }

      // Prevent changing the game - always Mobile Legends
      if (updateData.game && updateData.game !== "Mobile Legends: Bang Bang") {
        return reply.status(400).send({
          success: false,
          message:
            "Squad game cannot be changed from Mobile Legends: Bang Bang",
        });
      }

      const updatedSquad = await Squad.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      return reply.status(200).send({
        success: true,
        message: "Squad updated successfully",
        squad: updatedSquad,
      });
    } catch (error) {
      console.error("Update squad error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to update squad",
      });
    }
  });

  // Update squad join settings (leader only)
  fastify.put("/:id/join-settings", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { joinType, userId } = request.body as any;

      if (!joinType || !Object.values(SquadJoinType).includes(joinType)) {
        return reply.status(400).send({
          success: false,
          message: "Invalid join type",
        });
      }

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      // Only leader can update join settings
      if (squad.leader.toString() !== userId) {
        return reply.status(403).send({
          success: false,
          message: "Only squad leader can update join settings",
        });
      }

      squad.joinType = joinType;
      await squad.save();

      return reply.status(200).send({
        success: true,
        message: "Squad join settings updated successfully",
        squad: {
          id: squad._id,
          joinType: squad.joinType,
        },
      });
    } catch (error) {
      console.error("Update join settings error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to update join settings",
      });
    }
  });

  // Invite player to squad (leader only)
  fastify.post("/:id/invite", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { invitedUserId, message, userId } = request.body as any;

      if (!invitedUserId) {
        return reply.status(400).send({
          success: false,
          message: "Invited user ID is required",
        });
      }

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      // Only leader can invite players
      if (squad.leader.toString() !== userId) {
        return reply.status(403).send({
          success: false,
          message: "Only squad leader can invite players",
        });
      }

      // Check if squad is full
      if (squad.members.length >= squad.maxMembers) {
        return reply.status(400).send({
          success: false,
          message: "Squad is full",
        });
      }

      // Check if user is already a member
      if (squad.members.some((member) => member.toString() === invitedUserId)) {
        return reply.status(400).send({
          success: false,
          message: "User is already a member of this squad",
        });
      }

      // Check if user is already invited
      const existingInvitation = await SquadInvitation.findOne({
        squad: id,
        invitedUser: invitedUserId,
        status: InvitationStatus.PENDING,
      });

      if (existingInvitation) {
        return reply.status(400).send({
          success: false,
          message: "User already has a pending invitation",
        });
      }

      // Create invitation
      const invitation = new SquadInvitation({
        squad: id,
        invitedUser: invitedUserId,
        invitedBy: userId,
        message,
      });

      await invitation.save();

      const populatedInvitation = await SquadInvitation.findById(invitation._id)
        .populate("invitedUser", "name email avatar")
        .populate("invitedBy", "name email avatar")
        .populate("squad", "name tag")
        .lean();

      return reply.status(201).send({
        success: true,
        message: "Invitation sent successfully",
        invitation: populatedInvitation,
      });
    } catch (error) {
      console.error("Send invitation error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to send invitation",
      });
    }
  });

  // Respond to invitation (invited user)
  fastify.post("/:id/respond-invitation", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { invitationId, response, userId } = request.body as any;

      if (!invitationId || !response) {
        return reply.status(400).send({
          success: false,
          message: "Invitation ID and response are required",
        });
      }

      if (!["ACCEPT", "DECLINE"].includes(response)) {
        return reply.status(400).send({
          success: false,
          message: "Response must be either 'ACCEPT' or 'DECLINE'",
        });
      }

      const invitation = await SquadInvitation.findById(invitationId);
      if (!invitation) {
        return reply.status(404).send({
          success: false,
          message: "Invitation not found",
        });
      }

      // Verify the invitation is for this user
      if (invitation.invitedUser.toString() !== userId) {
        return reply.status(403).send({
          success: false,
          message: "You can only respond to your own invitations",
        });
      }

      // Check if invitation is still pending
      if (invitation.status !== InvitationStatus.PENDING) {
        return reply.status(400).send({
          success: false,
          message: "Invitation has already been responded to",
        });
      }

      // Check if invitation has expired
      if (invitation.expiresAt < new Date()) {
        invitation.status = InvitationStatus.EXPIRED;
        await invitation.save();
        return reply.status(400).send({
          success: false,
          message: "Invitation has expired",
        });
      }

      if (response === "ACCEPT") {
        // Add user to squad
        const squad = await Squad.findById(invitation.squad);
        if (!squad) {
          return reply.status(404).send({
            success: false,
            message: "Squad not found",
          });
        }

        if (squad.members.length >= squad.maxMembers) {
          return reply.status(400).send({
            success: false,
            message: "Squad is now full",
          });
        }

        squad.members.push(userId);
        await squad.save();

        invitation.status = InvitationStatus.ACCEPTED;
        await invitation.save();

        return reply.status(200).send({
          success: true,
          message: "Successfully joined squad",
          squad: await Squad.findById(squad._id)
            .populate("leader", "name email avatar")
            .populate("members", "name email avatar")
            .lean(),
        });
      } else {
        // Decline invitation
        invitation.status = InvitationStatus.DECLINED;
        await invitation.save();

        return reply.status(200).send({
          success: true,
          message: "Invitation declined",
        });
      }
    } catch (error) {
      console.error("Respond to invitation error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to respond to invitation",
      });
    }
  });

  // Apply to join squad
  fastify.post("/:id/apply", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId, message } = request.body as any;

      if (!userId) {
        return reply.status(400).send({
          success: false,
          message: "User ID is required",
        });
      }

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      if (!squad.isActive) {
        return reply.status(400).send({
          success: false,
          message: "Squad is not active",
        });
      }

      // Check if squad accepts applications
      if (squad.joinType === SquadJoinType.INVITE_ONLY) {
        return reply.status(400).send({
          success: false,
          message: "This squad only accepts invitations",
        });
      }

      // Check if squad is full
      if (squad.members.length >= squad.maxMembers) {
        return reply.status(400).send({
          success: false,
          message: "Squad is full",
        });
      }

      // Check if user is already a member
      if (squad.members.some((member) => member.toString() === userId)) {
        return reply.status(400).send({
          success: false,
          message: "User is already a member of this squad",
        });
      }

      // Check if user already has a pending application
      const existingApplication = await SquadApplication.findOne({
        squad: id,
        applicant: userId,
        status: ApplicationStatus.PENDING,
      });

      if (existingApplication) {
        return reply.status(400).send({
          success: false,
          message: "You already have a pending application to this squad",
        });
      }

      // Create application
      const application = new SquadApplication({
        squad: id,
        applicant: userId,
        message,
      });

      await application.save();

      const populatedApplication = await SquadApplication.findById(
        application._id
      )
        .populate("applicant", "name email avatar")
        .populate("squad", "name tag")
        .lean();

      return reply.status(201).send({
        success: true,
        message: "Application submitted successfully",
        application: populatedApplication,
      });
    } catch (error) {
      console.error("Submit application error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to submit application",
      });
    }
  });

  // Respond to application (squad leader)
  fastify.post("/:id/respond-application", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { applicationId, response, responseMessage, userId } =
        request.body as any;

      if (!applicationId || !response) {
        return reply.status(400).send({
          success: false,
          message: "Application ID and response are required",
        });
      }

      if (!["APPROVE", "REJECT"].includes(response)) {
        return reply.status(400).send({
          success: false,
          message: "Response must be either 'APPROVE' or 'REJECT'",
        });
      }

      const application = await SquadApplication.findById(applicationId);
      if (!application) {
        return reply.status(404).send({
          success: false,
          message: "Application not found",
        });
      }

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      // Only leader can respond to applications
      if (squad.leader.toString() !== userId) {
        return reply.status(403).send({
          success: false,
          message: "Only squad leader can respond to applications",
        });
      }

      // Check if application is still pending
      if (application.status !== ApplicationStatus.PENDING) {
        return reply.status(400).send({
          success: false,
          message: "Application has already been responded to",
        });
      }

      if (response === "APPROVE") {
        // Check if squad is full
        if (squad.members.length >= squad.maxMembers) {
          return reply.status(400).send({
            success: false,
            message: "Squad is now full",
          });
        }

        // Add user to squad
        squad.members.push(application.applicant);
        await squad.save();

        application.status = ApplicationStatus.APPROVED;
        application.responseMessage = responseMessage;
        application.respondedBy = userId;
        application.respondedAt = new Date();
        await application.save();

        return reply.status(200).send({
          success: true,
          message: "Application approved and user added to squad",
          squad: await Squad.findById(squad._id)
            .populate("leader", "name email avatar")
            .populate("members", "name email avatar")
            .lean(),
        });
      } else {
        // Reject application
        application.status = ApplicationStatus.REJECTED;
        application.responseMessage = responseMessage;
        application.respondedBy = userId;
        application.respondedAt = new Date();
        await application.save();

        return reply.status(200).send({
          success: true,
          message: "Application rejected",
        });
      }
    } catch (error) {
      console.error("Respond to application error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to respond to application",
      });
    }
  });

  // Get squad invitations (for squad leader)
  fastify.get("/:id/invitations", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.query as any;

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      // Only leader can view invitations
      if (squad.leader.toString() !== userId) {
        return reply.status(403).send({
          success: false,
          message: "Only squad leader can view invitations",
        });
      }

      const invitations = await SquadInvitation.find({ squad: id })
        .populate("invitedUser", "name email avatar")
        .populate("invitedBy", "name email avatar")
        .sort({ createdAt: -1 })
        .lean();

      return reply.status(200).send({
        success: true,
        invitations,
      });
    } catch (error) {
      console.error("Get invitations error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get invitations",
      });
    }
  });

  // Get squad applications (for squad leader)
  fastify.get("/:id/applications", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.query as any;

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      // Only leader can view applications
      if (squad.leader.toString() !== userId) {
        return reply.status(403).send({
          success: false,
          message: "Only squad leader can view applications",
        });
      }

      const applications = await SquadApplication.find({ squad: id })
        .populate("applicant", "name email avatar")
        .sort({ createdAt: -1 })
        .lean();

      return reply.status(200).send({
        success: true,
        applications,
      });
    } catch (error) {
      console.error("Get applications error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get applications",
      });
    }
  });

  // Get user's invitations
  fastify.get("/user/:userId/invitations", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      const invitations = await SquadInvitation.find({
        invitedUser: userId,
        status: InvitationStatus.PENDING,
      })
        .populate("squad", "name tag game logo")
        .populate("invitedBy", "name email avatar")
        .sort({ createdAt: -1 })
        .lean();

      return reply.status(200).send({
        success: true,
        invitations,
      });
    } catch (error) {
      console.error("Get user invitations error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get user invitations",
      });
    }
  });

  // Get user's applications
  fastify.get("/user/:userId/applications", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      const applications = await SquadApplication.find({
        applicant: userId,
      })
        .populate("squad", "name tag game logo")
        .sort({ createdAt: -1 })
        .lean();

      return reply.status(200).send({
        success: true,
        applications,
      });
    } catch (error) {
      console.error("Get user applications error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get user applications",
      });
    }
  });

  // Join squad (for open squads)
  fastify.post("/:id/join", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.body as any;

      if (!userId) {
        return reply.status(400).send({
          success: false,
          message: "User ID is required",
        });
      }

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      if (!squad.isActive) {
        return reply.status(400).send({
          success: false,
          message: "Squad is not active",
        });
      }

      // Check join type
      if (squad.joinType === SquadJoinType.INVITE_ONLY) {
        return reply.status(400).send({
          success: false,
          message: "This squad only accepts invitations",
        });
      }

      if (squad.joinType === SquadJoinType.OPEN_FOR_APPLY) {
        return reply.status(400).send({
          success: false,
          message:
            "This squad requires an application. Please use the apply endpoint.",
        });
      }

      if (squad.members.length >= squad.maxMembers) {
        return reply.status(400).send({
          success: false,
          message: "Squad is full",
        });
      }

      if (squad.members.some((member) => member.toString() === userId)) {
        return reply.status(400).send({
          success: false,
          message: "User is already a member of this squad",
        });
      }

      // Add user to squad
      squad.members.push(userId);
      await squad.save();

      const populatedSquad = await Squad.findById(squad._id)
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      return reply.status(200).send({
        success: true,
        message: "Successfully joined squad",
        squad: populatedSquad,
      });
    } catch (error) {
      console.error("Join squad error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to join squad",
      });
    }
  });

  // Leave squad
  fastify.post("/:id/leave", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.body as any;

      if (!userId) {
        return reply.status(400).send({
          success: false,
          message: "User ID is required",
        });
      }

      const squad = await Squad.findById(id);
      if (!squad) {
        return reply.status(404).send({
          success: false,
          message: "Squad not found",
        });
      }

      if (squad.leader.toString() === userId) {
        return reply.status(400).send({
          success: false,
          message: "Squad leader cannot leave the squad",
        });
      }

      if (!squad.members.some((member) => member.toString() === userId)) {
        return reply.status(400).send({
          success: false,
          message: "User is not a member of this squad",
        });
      }

      // Remove user from squad
      squad.members = squad.members.filter(
        (member) => member.toString() !== userId
      );
      await squad.save();

      const populatedSquad = await Squad.findById(squad._id)
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .lean();

      return reply.status(200).send({
        success: true,
        message: "Successfully left squad",
        squad: populatedSquad,
      });
    } catch (error) {
      console.error("Leave squad error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to leave squad",
      });
    }
  });

  // Get squads by game
  fastify.get("/game/:game", async (request, reply) => {
    try {
      const { game } = request.params as { game: string };
      const { page = 1, limit = 10 } = request.query as any;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [squads, total] = await Promise.all([
        Squad.find({ game, isActive: true })
          .populate("leader", "name email avatar")
          .populate("members", "name email avatar")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Squad.countDocuments({ game, isActive: true }),
      ]);

      return reply.status(200).send({
        success: true,
        squads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error("Get squads by game error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get squads by game",
      });
    }
  });

  // Get user's squads
  fastify.get("/user/:userId", async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string };

      console.log("Looking for squads for user ID:", userId);
      console.log("User ID type:", typeof userId);

      const squads = await Squad.find({
        $or: [{ leader: userId }, { members: userId }],
      })
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .sort({ createdAt: -1 })
        .lean();

      console.log("Found squads:", squads);
      console.log("Number of squads found:", squads.length);

      return reply.status(200).send({
        success: true,
        squads,
      });
    } catch (error) {
      console.error("Get user squads error:", error);
      return reply.status(500).send({
        success: false,
        message: "Failed to get user squads",
      });
    }
  });
};

export default squadRoutes;
