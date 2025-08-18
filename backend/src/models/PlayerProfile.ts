import mongoose, { Document, Schema } from "mongoose";

export interface IPlayerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  category: "PC" | "Mobile";
  game: string;
  role: string;
  realName?: string;
  inGameName: string;
  rank: string;
  experience: string;
  bio: string;
  avatar?: string;
  avatarPublicId?: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    twitch?: string;
    discord?: string;
    website?: string;
  };
  highlightVideo?: string;
  isLookingForTeam: boolean;
  achievements: string[];
  preferredRoles: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    timezone: string;
    preferredHours: string;
  };
  languages: string[];
  faceitData?: {
    faceitId: string;
    nickname: string;
    avatar: string;
    country: string;
    level: number;
    elo: number;
    gamePlayerStats?: {
      averageKD: number;
      averageKR: number;
      averageHeadshots: number;
      winRate: number;
      matches: number;
    };
    lastUpdated: Date;
    isActive: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const playerProfileSchema = new Schema<IPlayerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["PC", "Mobile"],
      required: true,
    },
    game: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    realName: {
      type: String,
      trim: true,
    },
    inGameName: {
      type: String,
      required: true,
    },
    rank: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    avatar: {
      type: String,
    },
    avatarPublicId: {
      type: String,
    },
    socialLinks: {
      twitter: String,
      instagram: String,
      youtube: String,
      twitch: String,
      discord: String,
      website: String,
    },
    highlightVideo: String,
    isLookingForTeam: {
      type: Boolean,
      default: true,
    },
    achievements: [String],
    preferredRoles: [String],
    availability: {
      weekdays: {
        type: Boolean,
        default: true,
      },
      weekends: {
        type: Boolean,
        default: true,
      },
      timezone: {
        type: String,
        default: "Asia/Ulaanbaatar",
      },
      preferredHours: {
        type: String,
        default: "18:00-22:00",
      },
    },
    languages: {
      type: [String],
      default: ["Mongolian"],
    },
    faceitData: {
      faceitId: {
        type: String,
        unique: true,
        sparse: true,
      },
      nickname: String,
      avatar: String,
      country: String,
      level: {
        type: Number,
        min: 1,
        max: 10,
      },
      elo: {
        type: Number,
        min: 100,
        max: 4000,
      },
      gamePlayerStats: {
        averageKD: Number,
        averageKR: Number,
        averageHeadshots: Number,
        winRate: Number,
        matches: Number,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries (userId already has unique index from schema)
playerProfileSchema.index({ game: 1 });
playerProfileSchema.index({ category: 1 });
playerProfileSchema.index({ isLookingForTeam: 1 });
playerProfileSchema.index({ "faceitData.faceitId": 1 });
playerProfileSchema.index({ "faceitData.level": 1 });
playerProfileSchema.index({ "faceitData.elo": 1 });

export default mongoose.model<IPlayerProfile>(
  "PlayerProfile",
  playerProfileSchema
);
