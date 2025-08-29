import mongoose, { Document, Schema } from "mongoose";

export interface ISquad extends Document {
  name: string;
  tag: string;
  leader: mongoose.Types.ObjectId; // User ID of the squad leader
  members: mongoose.Types.ObjectId[]; // Array of User IDs
  maxMembers: number; // Default 7, can be 5-7
  game: string; // Game this squad is for
  description?: string;
  logo?: string; // Squad logo/banner
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const squadSchema = new Schema<ISquad>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    tag: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
      uppercase: true,
    },
    leader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    maxMembers: {
      type: Number,
      required: true,
      min: 5,
      max: 7,
      default: 7,
    },
    game: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    logo: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
squadSchema.index({ leader: 1 });
squadSchema.index({ game: 1 });
squadSchema.index({ tag: 1 }, { unique: true });
squadSchema.index({ isActive: 1 });
squadSchema.index({ name: "text", description: "text" });

// Validation: Ensure leader is in members array
squadSchema.pre("save", function (next) {
  if (!this.members.includes(this.leader)) {
    this.members.push(this.leader);
  }

  // Ensure members array doesn't exceed maxMembers
  if (this.members.length > this.maxMembers) {
    return next(
      new Error(`Squad cannot have more than ${this.maxMembers} members`)
    );
  }

  next();
});

export default mongoose.model<ISquad>("Squad", squadSchema);
