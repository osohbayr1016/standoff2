import mongoose, { Document, Schema } from "mongoose";

export enum ProPlayerStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export interface IProPlayer extends Document {
  userId: mongoose.Types.ObjectId;
  game: string;
  rank: string;
  currentRank?: string;
  targetRank: string;
  price: number;
  estimatedTime: string;
  description: string;
  status: ProPlayerStatus;
  adminNotes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  totalBoosts: number;
  successfulBoosts: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const proPlayerSchema = new Schema<IProPlayer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    game: {
      type: String,
      required: true,
      trim: true,
    },
    rank: {
      type: String,
      required: true,
      trim: true,
    },
    currentRank: {
      type: String,
      required: false,
      trim: true,
    },
    targetRank: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedTime: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ProPlayerStatus),
      default: ProPlayerStatus.PENDING,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    totalBoosts: {
      type: Number,
      default: 0,
      min: 0,
    },
    successfulBoosts: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
proPlayerSchema.index({ status: 1, game: 1, isAvailable: 1 });
proPlayerSchema.index({ userId: 1 });

export default mongoose.model<IProPlayer>("ProPlayer", proPlayerSchema);
