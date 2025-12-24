import mongoose, { Document, Schema } from "mongoose";

export interface IPlayerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  category: "PC" | "Mobile";
  game: string;
  roles: string[];
  realName?: string;
  inGameName: string;
  standoff2Id?: string;
  mlbbId?: string; // MLBB Game ID (optional)
  rank?: string;
  rankStars?: number;
  experience?: string;
  bio?: string;
  avatar?: string;
  avatarPublicId?: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    twitch?: string;
    discord?: string;
    website?: string;
  };
  highlightVideo?: string;
  isLookingForTeam: boolean;
  achievements: string[];
  availability: {
    weekdays: boolean;
    weekends: boolean;
    timezone: string;
    preferredHours: string;
  };
  languages: string[];
  // Game Statistics
  elo: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  totalMatches: number;
  isOnline: boolean;
  lastSeen: Date;
  region?: string;
  friends: mongoose.Types.ObjectId[];
  uniqueId: string;
  // Verification fields
  verificationCode?: string;
  verificationCodeExpiresAt?: Date;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  isIdVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const playerProfileSchema = new Schema<IPlayerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // ... (rest of schema)
    verificationCode: {
      type: String,
      trim: true,
    },
    verificationCodeExpiresAt: {
      type: Date,
    },
    verificationStatus: {
      type: String,
      enum: ["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"],
      default: "UNVERIFIED",
    },
    isIdVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to generate unique ID
const generateUniqueId = async (inGameName: string, excludeId?: string): Promise<string> => {
  const baseId = (inGameName || "player")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 15);

  if (baseId.length === 0) {
    // Fallback if name has no valid characters
    const randomBase = Math.random().toString(36).substring(2, 10);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `player-${randomBase}-${randomSuffix}`;
  }

  const randomSuffix = Math.random().toString(36).substring(2, 8);
  let uniqueId = `${baseId}-${randomSuffix}`;

  // Ensure uniqueness
  const ProfileModel = mongoose.model("PlayerProfile");
  let counter = 0;
  while (counter < 20) {
    const existing = await ProfileModel.findOne({ uniqueId });
    if (!existing || (excludeId && existing._id.toString() === excludeId)) {
      break;
    }
    uniqueId = `${baseId}-${randomSuffix}-${counter}`;
    counter++;
  }

  return uniqueId;
};

// Generate unique ID before saving (create and update)
playerProfileSchema.pre("save", async function (next) {
  if (!this.uniqueId || this.uniqueId.trim() === "") {
    try {
      this.uniqueId = await generateUniqueId(
        this.inGameName,
        this._id?.toString()
      );
    } catch (error) {
      console.error("Error generating unique ID:", error);
      // Fallback to timestamp-based ID
      this.uniqueId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    }
  }
  next();
});

// Also handle findOneAndUpdate operations
playerProfileSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;
  const doc = await this.model.findOne(this.getQuery());

  if (doc && (!doc.uniqueId || doc.uniqueId.trim() === "")) {
    if (!update.$set) update.$set = {};
    update.$set.uniqueId = await generateUniqueId(
      doc.inGameName,
      doc._id.toString()
    );
  }

  next();
});

// Index for efficient queries (userId already has unique index from schema)
playerProfileSchema.index({ game: 1 });
playerProfileSchema.index({ category: 1 });
playerProfileSchema.index({ isLookingForTeam: 1 });
playerProfileSchema.index({ elo: -1 });
playerProfileSchema.index({ isOnline: 1 });
playerProfileSchema.index({ region: 1 });
playerProfileSchema.index({ region: 1 });

export default mongoose.model<IPlayerProfile>(
  "PlayerProfile",
  playerProfileSchema
);
