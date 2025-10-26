import mongoose, { Document, Schema } from "mongoose";

export enum BadgeType {
  ACHIEVEMENT = "ACHIEVEMENT", // Badge earned through achievements
  RANK = "RANK", // Badge based on rank/level
  SPECIAL = "SPECIAL", // Special badges (admin, moderator, etc.)
  SEASONAL = "SEASONAL", // Seasonal badges
  TOURNAMENT = "TOURNAMENT", // Tournament-specific badges
}

export enum BadgeRarity {
  COMMON = "COMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
  MYTHIC = "MYTHIC",
}

export interface IBadge extends Document {
  name: string;
  description: string;
  type: BadgeType;
  rarity: BadgeRarity;
  icon: string; // Icon URL or identifier
  color: string; // Badge color/theme
  borderColor?: string; // Border color for special effects
  glowEffect?: boolean; // Whether badge has glow effect
  animation?: string; // Animation identifier
  requirements: {
    achievementId?: mongoose.Types.ObjectId; // Required achievement
    rank?: string; // Required rank
    level?: number; // Required level
    tournamentWins?: number; // Required tournament wins
    specialCondition?: string; // Special condition
  };
  isActive: boolean;
  isSeasonal: boolean;
  seasonStart?: Date;
  seasonEnd?: Date;
  displayOrder: number; // Order in which badges are displayed
  createdAt: Date;
  updatedAt: Date;
}

const badgeSchema = new Schema<IBadge>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    type: {
      type: String,
      enum: Object.values(BadgeType),
      required: true,
    },
    rarity: {
      type: String,
      enum: Object.values(BadgeRarity),
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
      default: "#3B82F6", // Default blue color
    },
    borderColor: {
      type: String,
    },
    glowEffect: {
      type: Boolean,
      default: false,
    },
    animation: {
      type: String,
      trim: true,
    },
    requirements: {
      achievementId: {
        type: Schema.Types.ObjectId,
        ref: "Achievement",
      },
      rank: {
        type: String,
        trim: true,
      },
      level: {
        type: Number,
        min: 1,
      },
      tournamentWins: {
        type: Number,
        min: 0,
      },
      specialCondition: {
        type: String,
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSeasonal: {
      type: Boolean,
      default: false,
    },
    seasonStart: {
      type: Date,
    },
    seasonEnd: {
      type: Date,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
badgeSchema.index({ type: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ isActive: 1 });
badgeSchema.index({ isSeasonal: 1 });
badgeSchema.index({ displayOrder: 1 });

export default mongoose.model<IBadge>("Badge", badgeSchema);
