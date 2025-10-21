import mongoose, { Document, Schema } from "mongoose";

export enum MatchType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum MatchStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  PLAYING = "PLAYING",
  RESULT_SUBMITTED = "RESULT_SUBMITTED",
  COMPLETED = "COMPLETED",
  DISPUTED = "DISPUTED",
  CANCELLED = "CANCELLED",
}

export enum MatchResult {
  WIN = "WIN",
  LOSS = "LOSS",
}

export enum AdminResolution {
  SQUAD_A_WON = "SQUAD_A_WON",
  SQUAD_B_WON = "SQUAD_B_WON",
  DRAW = "DRAW",
  CANCELLED = "CANCELLED",
}

export interface IMatchEvidence {
  images: string[];
  description?: string;
}

export interface IMatch extends Document {
  type: MatchType;

  // Squad мэдээлэл
  challengerSquadId: mongoose.Types.ObjectId;
  opponentSquadId?: mongoose.Types.ObjectId;

  // Bounty болон coin
  bountyAmount: number;
  coinsLocked: boolean;

  // Цаг хугацаа
  deadline: Date;
  startedAt?: Date;
  resultDeadline?: Date;
  completedAt?: Date;

  // Status
  status: MatchStatus;

  // Үр дүн оруулах
  challengerResult?: MatchResult;
  opponentResult?: MatchResult;

  // Эцсийн үр дүн
  winnerId?: mongoose.Types.ObjectId;

  // Dispute
  disputeReason?: string;
  challengerEvidence?: IMatchEvidence;
  opponentEvidence?: IMatchEvidence;
  adminResolution?: AdminResolution;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    type: {
      type: String,
      enum: Object.values(MatchType),
      required: true,
    },
    challengerSquadId: {
      type: Schema.Types.ObjectId,
      ref: "Squad",
      required: true,
      index: true,
    },
    opponentSquadId: {
      type: Schema.Types.ObjectId,
      ref: "Squad",
      index: true,
    },
    bountyAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    coinsLocked: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: Date,
      required: true,
    },
    startedAt: {
      type: Date,
    },
    resultDeadline: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(MatchStatus),
      default: MatchStatus.PENDING,
      index: true,
    },
    challengerResult: {
      type: String,
      enum: Object.values(MatchResult),
    },
    opponentResult: {
      type: String,
      enum: Object.values(MatchResult),
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: "Squad",
    },
    disputeReason: {
      type: String,
      maxlength: 1000,
    },
    challengerEvidence: {
      images: {
        type: [String],
        validate: [(val: string[]) => val.length <= 2, "Дээд тал нь 2 зураг"],
      },
      description: {
        type: String,
        maxlength: 500,
      },
    },
    opponentEvidence: {
      images: {
        type: [String],
        validate: [(val: string[]) => val.length <= 2, "Дээд тал нь 2 зураг"],
      },
      description: {
        type: String,
        maxlength: 500,
      },
    },
    adminResolution: {
      type: String,
      enum: Object.values(AdminResolution),
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
matchSchema.index({ status: 1, createdAt: -1 });
matchSchema.index({ type: 1, status: 1 });
matchSchema.index({ deadline: 1 });
matchSchema.index({ resultDeadline: 1 });

export default mongoose.model<IMatch>("Match", matchSchema);
