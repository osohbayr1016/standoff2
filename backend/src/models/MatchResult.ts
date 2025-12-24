import mongoose, { Document, Schema } from "mongoose";

export enum ResultStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IMatchResult extends Document {
  matchLobbyId: mongoose.Types.ObjectId;
  submittedBy: mongoose.Types.ObjectId;
  screenshots: string[];
  status: ResultStatus;
  submittedAt: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const matchResultSchema = new Schema<IMatchResult>(
  {
    matchLobbyId: {
      type: Schema.Types.ObjectId,
      ref: "MatchLobby",
      required: true,
      index: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    screenshots: {
      type: [String],
      required: true,
      validate: {
        validator: function (val: string[]) {
          return val.length >= 2 && val.length <= 4;
        },
        message: "Must have between 2 and 4 screenshots",
      },
    },
    status: {
      type: String,
      enum: Object.values(ResultStatus),
      default: ResultStatus.PENDING,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding results by lobby
matchResultSchema.index({ matchLobbyId: 1, submittedAt: -1 });

const MatchResult = mongoose.model<IMatchResult>("MatchResult", matchResultSchema);

export default MatchResult;

