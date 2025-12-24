"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const playerProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
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
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    region: {
        type: String,
        default: "Global",
    },
    friends: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    uniqueId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    verificationCode: {
        type: String,
        trim: true,
    },
    verificationCodeExpiresAt: {
        type: Date,
    },
    isIdVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
const generateUniqueId = async (inGameName, excludeId) => {
    const baseId = (inGameName || "player")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .substring(0, 15);
    if (baseId.length === 0) {
        const randomBase = Math.random().toString(36).substring(2, 10);
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `player-${randomBase}-${randomSuffix}`;
    }
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    let uniqueId = `${baseId}-${randomSuffix}`;
    const ProfileModel = mongoose_1.default.model("PlayerProfile");
    let counter = 0;
    while (counter < 20) {
        const existing = await ProfileModel.findOne({ uniqueId });
        if (!existing || (excludeId && existing._id.toString() === excludeId)) {
            break;
        }
        uniqueId = `${baseId}-${randomSuffix}-${counter}`;
        counter++;
    }
    return uniqueId;https://github.com/osohbayr1016/standoff2/pull/1/conflict?name=backend%252Fdist%252Fconfig%252Fsocket.js&ancestor_oid=ad9f4b8dcb6e1e9d20dddc56a7701866e5b51a2c&base_oid=6d7810ebffaa55aaf947ff16401fcecd49d97913&head_oid=5439e2b7e39489c4420e6aa1737d00944a0dd72d
};
playerProfileSchema.pre("save", async function (next) {
    if (!this.uniqueId || this.uniqueId.trim() === "") {
        try {
            this.uniqueId = await generateUniqueId(this.inGameName, this._id?.toString());
        }
        catch (error) {
            console.error("Error generating unique ID:", error);
            this.uniqueId = `player-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
        }
    }
    next();
});
playerProfileSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    const doc = await this.model.findOne(this.getQuery());
    if (doc && (!doc.uniqueId || doc.uniqueId.trim() === "")) {
        if (!update.$set)
            update.$set = {};
        update.$set.uniqueId = await generateUniqueId(doc.inGameName, doc._id.toString());
    }
    next();
});
playerProfileSchema.index({ game: 1 });
playerProfileSchema.index({ category: 1 });
playerProfileSchema.index({ isLookingForTeam: 1 });
playerProfileSchema.index({ elo: -1 });
playerProfileSchema.index({ isOnline: 1 });
playerProfileSchema.index({ region: 1 });
playerProfileSchema.index({ region: 1 });
exports.default = mongoose_1.default.model("PlayerProfile", playerProfileSchema);
