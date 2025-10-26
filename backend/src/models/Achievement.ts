import mongoose, { Document, Schema } from "mongoose";

export enum AchievementCategory {
  TOURNAMENT = "TOURNAMENT",
  MATCH = "MATCH",
  SOCIAL = "SOCIAL",
  PROGRESS = "PROGRESS",
  SPECIAL = "SPECIAL",
  SEASONAL = "SEASONAL",
}

export enum AchievementRarity {
  COMMON = "COMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
}

export enum AchievementType {
  COUNTER = "COUNTER", // Count-based achievements (e.g., win 10 matches)
  MILESTONE = "MILESTONE", // Milestone achievements (e.g., reach rank X)
  CONDITIONAL = "CONDITIONAL", // Conditional achievements (e.g., win streak of 5)
  TIME_BASED = "TIME_BASED", // Time-based achievements (e.g., play for 30 days)
}

export interface IAchievement extends Document {
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  type: AchievementType;
  icon: string; // Icon URL or identifier
  points: number; // Points awarded for this achievement
  requirements: {
    counter?: number; // For COUNTER type
    condition?: string; // For CONDITIONAL type
    milestone?: string; // For MILESTONE type
    timeFrame?: number; // For TIME_BASED type (in days)
    game?: string; // Specific game requirement
    rank?: string; // Specific rank requirement
  };
  rewards: {
    bountyCoins?: number;
    experience?: number;
    badge?: mongoose.Types.ObjectId; // Reference to Badge
    title?: string; // Special title
  };
  isActive: boolean;
  isSeasonal: boolean;
  seasonStart?: Date;
  seasonEnd?: Date;
  prerequisites?: mongoose.Types.ObjectId[]; // Other achievements that must be completed first
  createdAt: Date;
  updatedAt: Date;
}

const achievementSchema = new Schema<IAchievement>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: Object.values(AchievementCategory),
      required: true,
    },
    rarity: {
      type: String,
      enum: Object.values(AchievementRarity),
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(AchievementType),
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 1,
    },
    requirements: {
      counter: {
        type: Number,
        min: 1,
      },
      condition: {
        type: String,
        trim: true,
      },
      milestone: {
        type: String,
        trim: true,
      },
      timeFrame: {
        type: Number,
        min: 1,
      },
      game: {
        type: String,
        trim: true,
      },
      rank: {
        type: String,
        trim: true,
      },
    },
    rewards: {
      bountyCoins: {
        type: Number,
        min: 0,
      },
      experience: {
        type: Number,
        min: 0,
      },
      badge: {
        type: Schema.Types.ObjectId,
        ref: "Badge",
      },
      title: {
        type: String,
        trim: true,
        maxlength: 50,
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
    prerequisites: [{
      type: Schema.Types.ObjectId,
      ref: "Achievement",
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
achievementSchema.index({ category: 1 });
achievementSchema.index({ rarity: 1 });
achievementSchema.index({ type: 1 });
achievementSchema.index({ isActive: 1 });
achievementSchema.index({ isSeasonal: 1 });

export default mongoose.model<IAchievement>("Achievement", achievementSchema);
