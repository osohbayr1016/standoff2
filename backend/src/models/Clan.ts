import mongoose, { Document, Schema } from "mongoose";

export interface IClanMember {
  id: string;
  name: string;
  avatar: string;
  status: "pending" | "accepted" | "declined";
  invitedAt: string;
  joinedAt?: string;
}

export interface IClan extends Document {
  name: string;
  tag: string;
  description?: string;
  logo?: string;
  leader: string; // User ID of the clan leader
  members: IClanMember[];
  maxMembers: number; // Free plan: 10, Premium: more
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const clanMemberSchema = new Schema<IClanMember>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: "/default-avatar.png" },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  invitedAt: { type: String, required: true },
  joinedAt: { type: String },
});

const clanSchema = new Schema<IClan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    tag: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 6,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    logo: {
      type: String,
      default: "/default-avatar.png",
    },
    leader: {
      type: String,
      required: true,
      ref: "User",
    },
    members: [clanMemberSchema],
    maxMembers: {
      type: Number,
      default: 10, // Free plan limit
      min: 1,
      max: 100,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
clanSchema.index({ tag: 1 }, { unique: true });
clanSchema.index({ leader: 1 });
clanSchema.index({ "members.id": 1 });

// Virtual for member count
clanSchema.virtual("memberCount").get(function () {
  return this.members
    ? this.members.filter((member) => member.status === "accepted").length
    : 0;
});

// Virtual for pending invites count
clanSchema.virtual("pendingInvitesCount").get(function () {
  return this.members
    ? this.members.filter((member) => member.status === "pending").length
    : 0;
});

// Ensure virtuals are serialized
clanSchema.set("toJSON", { virtuals: true });
clanSchema.set("toObject", { virtuals: true });

export default mongoose.model<IClan>("Clan", clanSchema);
