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
exports.ProPlayerStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ProPlayerStatus;
(function (ProPlayerStatus) {
    ProPlayerStatus["PENDING"] = "PENDING";
    ProPlayerStatus["APPROVED"] = "APPROVED";
    ProPlayerStatus["REJECTED"] = "REJECTED";
    ProPlayerStatus["SUSPENDED"] = "SUSPENDED";
})(ProPlayerStatus || (exports.ProPlayerStatus = ProPlayerStatus = {}));
const proPlayerSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    game: {
        type: String,
        required: true,
        trim: true,
    },
    rank: {
        type: String,
        required: true,
        trim: true,
    },
    currentRank: {
        type: String,
        required: false,
        trim: true,
    },
    targetRank: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    estimatedTime: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(ProPlayerStatus),
        default: ProPlayerStatus.PENDING,
    },
    adminNotes: {
        type: String,
        trim: true,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    approvedAt: {
        type: Date,
    },
    totalBoosts: {
        type: Number,
        default: 0,
        min: 0,
    },
    successfulBoosts: {
        type: Number,
        default: 0,
        min: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
proPlayerSchema.index({ status: 1, game: 1, isAvailable: 1 });
proPlayerSchema.index({ userId: 1 });
exports.default = mongoose_1.default.model("ProPlayer", proPlayerSchema);
