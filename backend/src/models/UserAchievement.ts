import mongoose, { Document, Schema } from "mongoose";

export enum UserAchievementStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CLAIMED = "CLAIMED",
}

export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementId: mongoose.Types.ObjectId;
  status: UserAchievementStatus;
  progress: {
    current: number; // Current progress value
    target: number; // Target value to complete
    percentage: number; // Progress percentage (0-100)
  };
  completedAt?: Date; // When achievement was completed
  claimedAt?: Date; // When rewards were claimed
  rewardsClaimed: {
    bountyCoins: boolean;
    experience: boolean;
    badge: boolean;
    title: boolean;
  };
  metadata?: {
    game?: string; // Game-specific data
    rank?: string; // Rank when achieved
    tournamentId?: mongoose.Types.ObjectId; // Tournament context
    matchId?: mongoose.Types.ObjectId; // Match context
    [key: string]: any; // Additional metadata
  };
  createdAt: Date;
  updatedAt: Date;
}

const userAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(UserAchievementStatus),
      default: UserAchievementStatus.IN_PROGRESS,
    },
    progress: {
      current: {
        type: Number,
        default: 0,
        min: 0,
      },
      target: {
        type: Number,
        required: true,
        min: 1,
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
    },
    completedAt: {
      type: Date,
    },
    claimedAt: {
      type: Date,
    },
    rewardsClaimed: {
      bountyCoins: {
        type: Boolean,
        default: false,
      },
      experience: {
        type: Boolean,
        default: false,
      },
      badge: {
        type: Boolean,
        default: false,
      },
      title: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one achievement per user
userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

// Indexes for efficient queries
userAchievementSchema.index({ userId: 1, status: 1 });
userAchievementSchema.index({ achievementId: 1 });
userAchievementSchema.index({ completedAt: 1 });
userAchievementSchema.index({ "progress.percentage": 1 });

export default mongoose.model<IUserAchievement>("UserAchievement", userAchievementSchema);
