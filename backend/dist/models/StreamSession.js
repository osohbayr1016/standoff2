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
const streamSessionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    streamKey: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["scheduled", "live", "ended", "cancelled"],
        default: "scheduled",
        index: true,
    },
    tournamentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Tournament",
        index: true,
    },
    matchId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Match",
        index: true,
    },
    organizerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    platforms: [{
            platform: {
                type: String,
                enum: ["twitch", "youtube", "custom", "multi"],
                required: true,
            },
            streamUrl: String,
            embedUrl: String,
            channelId: String,
            streamId: String,
            isActive: {
                type: Boolean,
                default: true,
            },
        }],
    scheduledStartTime: {
        type: Date,
        index: true,
    },
    actualStartTime: Date,
    endTime: Date,
    duration: {
        type: Number,
        min: 0,
    },
    peakViewers: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalViewers: {
        type: Number,
        default: 0,
        min: 0,
    },
    currentViewers: {
        type: Number,
        default: 0,
        min: 0,
    },
    externalStreamUrl: String,
    externalPlatform: {
        type: String,
        enum: ["youtube", "facebook", "kick", "twitch"],
    },
    externalThumbnail: String,
    isLiveStatus: {
        type: String,
        enum: ["live", "offline"],
        default: "offline",
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    allowChat: {
        type: Boolean,
        default: true,
    },
    allowReactions: {
        type: Boolean,
        default: true,
    },
    quality: {
        type: String,
        enum: ["720p", "1080p", "4k"],
        default: "1080p",
    },
    bitrate: {
        type: Number,
        min: 0,
    },
    resolution: String,
    tags: [{
            type: String,
            trim: true,
        }],
    thumbnail: String,
    moderators: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        }],
}, {
    timestamps: true,
});
streamSessionSchema.index({ status: 1, scheduledStartTime: 1 });
streamSessionSchema.index({ tournamentId: 1, status: 1 });
streamSessionSchema.index({ matchId: 1, status: 1 });
streamSessionSchema.index({ organizerId: 1, status: 1 });
streamSessionSchema.index({ tags: 1 });
streamSessionSchema.index({ isPublic: 1, status: 1 });
exports.default = mongoose_1.default.model("StreamSession", streamSessionSchema);
