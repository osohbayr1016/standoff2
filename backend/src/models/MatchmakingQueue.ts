import mongoose, { Document, Schema } from "mongoose";

export interface IMatchmakingQueue extends Document {
  userId: mongoose.Types.ObjectId;
  partyMembers: mongoose.Types.ObjectId[];
  partySize: number;
  joinedAt: Date;
  averageElo: number;
}

const matchmakingQueueSchema = new Schema<IMatchmakingQueue>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    partyMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    partySize: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 1,
    },
    joinedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    averageElo: {
      type: Number,
      required: true,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queue queries
matchmakingQueueSchema.index({ joinedAt: 1 });
matchmakingQueueSchema.index({ userId: 1 }, { unique: true });

const MatchmakingQueue = mongoose.model<IMatchmakingQueue>(
  "MatchmakingQueue",
  matchmakingQueueSchema
);

export default MatchmakingQueue;

