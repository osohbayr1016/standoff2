import mongoose, { Document, Schema } from "mongoose";

export interface IMatchChat extends Document {
  matchId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const matchChatSchema = new Schema<IMatchChat>(
  {
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
matchChatSchema.index({ matchId: 1, createdAt: 1 });

export default mongoose.model<IMatchChat>("MatchChat", matchChatSchema);
