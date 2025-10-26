import mongoose, { Document, Schema } from "mongoose";

export interface IUserBadge extends Document {
  userId: mongoose.Types.ObjectId;
  badgeId: mongoose.Types.ObjectId;
  earnedAt: Date; // When the badge was earned
  isEquipped: boolean; // Whether user has equipped this badge
  equippedAt?: Date; // When the badge was equipped
  metadata?: {
    achievementId?: mongoose.Types.ObjectId; // If earned through achievement
    tournamentId?: mongoose.Types.ObjectId; // If earned through tournament
    rank?: string; // Rank when earned
    game?: string; // Game context
    [key: string]: any; // Additional metadata
  };
  createdAt: Date;
  updatedAt: Date;
}

const userBadgeSchema = new Schema<IUserBadge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    badgeId: {
      type: Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    earnedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    isEquipped: {
      type: Boolean,
      default: false,
    },
    equippedAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one badge per user
userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// Indexes for efficient queries
userBadgeSchema.index({ userId: 1, isEquipped: 1 });
userBadgeSchema.index({ badgeId: 1 });
userBadgeSchema.index({ earnedAt: 1 });

export default mongoose.model<IUserBadge>("UserBadge", userBadgeSchema);
