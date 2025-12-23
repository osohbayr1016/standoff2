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
exports.ApplicationStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "PENDING";
    ApplicationStatus["APPROVED"] = "APPROVED";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["WITHDRAWN"] = "WITHDRAWN";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
const squadApplicationSchema = new mongoose_1.Schema({
    squad: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Squad",
        required: true,
    },
    applicant: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(ApplicationStatus),
        default: ApplicationStatus.PENDING,
    },
    message: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    responseMessage: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    respondedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    respondedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
squadApplicationSchema.index({ squad: 1, applicant: 1, status: 1 }, { unique: true, partialFilterExpression: { status: ApplicationStatus.PENDING } });
squadApplicationSchema.index({ applicant: 1, status: 1 });
squadApplicationSchema.index({ squad: 1, status: 1 });
squadApplicationSchema.index({ createdAt: -1 });
squadApplicationSchema.pre("save", async function (next) {
    if (this.isNew && this.status === ApplicationStatus.PENDING) {
        try {
            const existingApplication = await mongoose_1.default
                .model("SquadApplication")
                .findOne({
                squad: this.squad,
                applicant: this.applicant,
                status: ApplicationStatus.PENDING,
            });
            if (existingApplication) {
                return next(new Error("User already has a pending application to this squad"));
            }
        }
        catch (error) {
            console.warn("Error checking for duplicate application:", error);
        }
    }
    next();
});
exports.default = mongoose_1.default.model("SquadApplication", squadApplicationSchema);
