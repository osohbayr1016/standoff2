import mongoose, { Document, Schema } from "mongoose";

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: "leader" | "member";
  status: "active" | "pending" | "declined" | "removed";
  joinedAt: Date;
  invitedAt: Date;
  invitedBy: mongoose.Types.ObjectId;
}

export interface ITeam extends Document {
  name: string;
  tag: string;
  logo?: string;
  logoPublicId?: string;
  game: string;
  gameCategory: "PC" | "Mobile";
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  members: ITeamMember[];
  maxMembers: number;
  isActive: boolean;
  isLookingForMembers: boolean;
  requirements?: {
    minRank?: string;
    minExperience?: string;
    requiredRoles?: string[];
    language?: string[];
  };
  achievements?: string[];
  socialLinks?: {
    discord?: string;
    website?: string;
  };
  stats?: {
    wins: number;
    losses: number;
    tournamentsPlayed: number;
    tournamentsWon: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<ITeamMember>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["leader", "member"],
    default: "member",
  },
  status: {
    type: String,
    enum: ["active", "pending", "declined", "removed"],
    default: "pending",
  },
  joinedAt: {
    type: Date,
  },
  invitedAt: {
    type: Date,
    default: Date.now,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    tag: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 4,
    },
    logo: {
      type: String,
    },
    logoPublicId: {
      type: String,
    },
    game: {
      type: String,
      required: true,
    },
    gameCategory: {
      type: String,
      enum: ["PC", "Mobile"],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [teamMemberSchema],
    maxMembers: {
      type: Number,
      default: 5,
      min: 2,
      max: 10,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isLookingForMembers: {
      type: Boolean,
      default: true,
    },
    requirements: {
      minRank: String,
      minExperience: String,
      requiredRoles: [String],
      language: [String],
    },
    achievements: [String],
    socialLinks: {
      discord: String,
      website: String,
    },
    stats: {
      wins: {
        type: Number,
        default: 0,
      },
      losses: {
        type: Number,
        default: 0,
      },
      tournamentsPlayed: {
        type: Number,
        default: 0,
      },
      tournamentsWon: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
teamSchema.index({ game: 1 });
teamSchema.index({ gameCategory: 1 });
teamSchema.index({ isActive: 1 });
teamSchema.index({ isLookingForMembers: 1 });
teamSchema.index({ "members.userId": 1 });
teamSchema.index({ createdBy: 1 });
teamSchema.index({ tag: 1 }, { unique: true });

// Virtual for getting active members count
teamSchema.virtual("activeMembersCount").get(function () {
  return this.members.filter((member) => member.status === "active").length;
});

// Virtual for getting pending members count
teamSchema.virtual("pendingMembersCount").get(function () {
  return this.members.filter((member) => member.status === "pending").length;
});

// Method to check if user is team leader
teamSchema.methods.isLeader = function (userId: string) {
  const member = this.members.find(
    (member: ITeamMember) =>
      member.userId.toString() === userId && member.status === "active"
  );
  return member?.role === "leader";
};

// Method to check if user is team member
teamSchema.methods.isMember = function (userId: string) {
  return this.members.some(
    (member: ITeamMember) =>
      member.userId.toString() === userId && member.status === "active"
  );
};

// Method to get user's membership status
teamSchema.methods.getMembershipStatus = function (userId: string) {
  const member = this.members.find(
    (member: ITeamMember) => member.userId.toString() === userId
  );
  return member?.status || null;
};

export default mongoose.model<ITeam>("Team", teamSchema);
