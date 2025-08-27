import mongoose, { Document, Schema } from "mongoose";

export interface ITournament extends Document {
  name: string;
  description: string;
  game: string;
  startDate: Date;
  endDate: Date;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  location: string;
  organizer: string;
  rules: string;
  registrationDeadline: Date;
  participants: string[];
  brackets?: any;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    game: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    prizePool: {
      type: Number,
      required: true,
      min: 0,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 2,
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
    },
    rules: {
      type: String,
      trim: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    brackets: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
tournamentSchema.index({ game: 1 });
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ startDate: 1 });
tournamentSchema.index({ organizer: 1 });
tournamentSchema.index({ name: "text", description: "text" });

export default mongoose.model<ITournament>("Tournament", tournamentSchema);
