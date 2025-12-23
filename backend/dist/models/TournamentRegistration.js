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
const tournamentRegistrationSchema = new mongoose_1.Schema({
    tournament: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true,
    },
    squad: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
        required: true,
    },
    squadLeader: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    squadMembers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    ],
    registrationFee: {
        type: Number,
        required: true,
        default: 5000,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },
    paymentDate: {
        type: Date,
    },
    paymentProof: {
        type: String,
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    approvedAt: {
        type: Date,
    },
    approvalStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    rejectionReason: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    status: {
        type: String,
        enum: [
            "registered",
            "active",
            "eliminated",
            "winner",
            "runner_up",
            "third_place",
        ],
        default: "registered",
    },
    tournamentBracket: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    isBanned: {
        type: Boolean,
        default: false,
        index: true,
    },
    banReason: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    bannedAt: {
        type: Date,
    },
    bannedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
});
tournamentRegistrationSchema.index({ tournament: 1, squad: 1 }, { unique: true });
tournamentRegistrationSchema.index({ tournament: 1 });
tournamentRegistrationSchema.index({ squad: 1 });
tournamentRegistrationSchema.index({ squadLeader: 1 });
tournamentRegistrationSchema.index({ paymentStatus: 1 });
tournamentRegistrationSchema.index({ isApproved: 1 });
tournamentRegistrationSchema.index({ approvalStatus: 1 });
tournamentRegistrationSchema.index({ status: 1 });
tournamentRegistrationSchema.pre("save", function (next) {
    if (!this.squadMembers.includes(this.squadLeader)) {
        this.squadMembers.push(this.squadLeader);
    }
    next();
});
exports.default = mongoose_1.default.model("TournamentRegistration", tournamentRegistrationSchema);
