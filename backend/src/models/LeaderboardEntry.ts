import mongoose, { Document, Schema } from "mongoose";

export enum LeaderboardType {
  ACHIEVEMENT_POINTS = "ACHIEVEMENT_POINTS",
  TOURNAMENT_WINS = "TOURNAMENT_WINS",
  MATCH_WINS = "MATCH_WINS",
  BOUNTY_COINS = "BOUNTY_COINS",
  LEVEL = "LEVEL",
  SEASONAL = "SEASONAL",
}

export enum LeaderboardPeriod {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  SEASONAL = "SEASONAL",
  ALL_TIME = "ALL_TIME",
}

export interface ILeaderboardEntry extends Document {
  userId: mongoose.Types.ObjectId;
  leaderboardType: LeaderboardType;
  period: LeaderboardPeriod;
  score: number;
  rank: number;
  metadata?: {
    game?: string;
    category?: string;
    season?: string;
    [key: string]: any;
  };
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leaderboardEntrySchema = new Schema<ILeaderboardEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaderboardType: {
      type: String,
      enum: Object.values(LeaderboardType),
      required: true,
    },
    period: {
      type: String,
      enum: Object.values(LeaderboardPeriod),
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    lastUpdated: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient leaderboard queries
leaderboardEntrySchema.index({ leaderboardType: 1, period: 1, rank: 1 });
leaderboardEntrySchema.index({ userId: 1, leaderboardType: 1, period: 1 }, { unique: true });
leaderboardEntrySchema.index({ score: -1 }); // For sorting by score

export default mongoose.model<ILeaderboardEntry>("LeaderboardEntry", leaderboardEntrySchema);
