import mongoose, { Document, Schema } from "mongoose";

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  EXPIRED = "EXPIRED",
}

export interface ISquadInvitation extends Document {
  squad: mongoose.Types.ObjectId; // Squad ID
  invitedUser: mongoose.Types.ObjectId; // User being invited
  invitedBy: mongoose.Types.ObjectId; // User who sent the invitation (usually squad leader)
  status: InvitationStatus;
  message?: string; // Optional message from inviter
  expiresAt: Date; // Invitation expiration date
  createdAt: Date;
  updatedAt: Date;
}

const squadInvitationSchema = new Schema<ISquadInvitation>(
  {
    squad: {
      type: Schema.Types.ObjectId,
      ref: "Squad",
      required: true,
    },
    invitedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
squadInvitationSchema.index({ squad: 1, invitedUser: 1 }, { unique: true });
squadInvitationSchema.index({ invitedUser: 1, status: 1 });
squadInvitationSchema.index({ squad: 1, status: 1 });
squadInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired invitations

// Validation: Prevent duplicate pending invitations
squadInvitationSchema.pre("save", async function (next) {
  if (this.isNew && this.status === InvitationStatus.PENDING) {
    const existingInvitation = await mongoose.model("SquadInvitation").findOne({
      squad: this.squad,
      invitedUser: this.invitedUser,
      status: InvitationStatus.PENDING,
    });

    if (existingInvitation) {
      return next(
        new Error("User already has a pending invitation to this squad")
      );
    }
  }
  next();
});

export default mongoose.model<ISquadInvitation>(
  "SquadInvitation",
  squadInvitationSchema
);
