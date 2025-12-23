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
const tournamentSchema = new mongoose_1.Schema({
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
    prizeDistribution: {
        firstPlace: {
            type: Number,
            required: true,
            min: 0,
        },
        secondPlace: {
            type: Number,
            required: true,
            min: 0,
        },
        thirdPlace: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    maxSquads: {
        type: Number,
        required: true,
        min: 2,
    },
    currentSquads: {
        type: Number,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        enum: [
            "upcoming",
            "registration_open",
            "registration_closed",
            "ongoing",
            "completed",
            "cancelled",
        ],
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
    organizerLogo: {
        type: String,
    },
    bannerImage: {
        type: String,
    },
    rules: {
        type: String,
        trim: true,
    },
    registrationDeadline: {
        type: Date,
        required: true,
    },
    entryFee: {
        type: Number,
        required: true,
        default: 5000,
        min: 0,
    },
    tournamentType: {
        type: String,
        enum: ["tax", "free"],
        required: true,
        default: "tax",
    },
    format: {
        type: String,
        required: true,
        default: "Single Elimination",
        trim: true,
    },
    brackets: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
tournamentSchema.index({ game: 1 });
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ startDate: 1 });
tournamentSchema.index({ organizer: 1 });
tournamentSchema.index({ tournamentType: 1 });
tournamentSchema.index({ name: "text", description: "text" });
exports.default = mongoose_1.default.model("Tournament", tournamentSchema);
