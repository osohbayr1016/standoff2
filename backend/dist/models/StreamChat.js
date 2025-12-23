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
const streamChatSchema = new mongoose_1.Schema({
    streamSessionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "StreamSession",
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    isModerator: {
        type: Boolean,
        default: false,
    },
    isSubscriber: {
        type: Boolean,
        default: false,
    },
    isVip: {
        type: Boolean,
        default: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    deletedAt: Date,
    deletedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    reactions: [{
            emoji: {
                type: String,
                required: true,
            },
            count: {
                type: Number,
                default: 0,
                min: 0,
            },
            users: [{
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: "User",
                }],
        }],
    replyToId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "StreamChat",
    },
}, {
    timestamps: true,
});
streamChatSchema.index({ streamSessionId: 1, timestamp: -1 });
streamChatSchema.index({ streamSessionId: 1, isDeleted: 1, timestamp: -1 });
streamChatSchema.index({ userId: 1, timestamp: -1 });
exports.default = mongoose_1.default.model("StreamChat", streamChatSchema);
