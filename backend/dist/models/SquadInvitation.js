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
exports.InvitationStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "PENDING";
    InvitationStatus["ACCEPTED"] = "ACCEPTED";
    InvitationStatus["DECLINED"] = "DECLINED";
    InvitationStatus["EXPIRED"] = "EXPIRED";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
const squadInvitationSchema = new mongoose_1.Schema({
    squad: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
        required: true,
    },
    invitedUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    invitedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
}, {
    timestamps: true,
});
squadInvitationSchema.index({ squad: 1, invitedUser: 1 }, { unique: true });
squadInvitationSchema.index({ invitedUser: 1, status: 1 });
squadInvitationSchema.index({ squad: 1, status: 1 });
squadInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
squadInvitationSchema.pre("save", async function (next) {
    if (this.isNew && this.status === InvitationStatus.PENDING) {
        const existingInvitation = await mongoose_1.default.model("SquadInvitation").findOne({
            squad: this.squad,
            invitedUser: this.invitedUser,
            status: InvitationStatus.PENDING,
        });
        if (existingInvitation) {
            return next(new Error("User already has a pending invitation to this squad"));
        }
    }
    next();
});
exports.default = mongoose_1.default.model("SquadInvitation", squadInvitationSchema);
