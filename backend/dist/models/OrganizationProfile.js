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
const organizationProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    organizationName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    logo: {
        type: String,
    },
    logoPublicId: {
        type: String,
    },
    website: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    foundedYear: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear(),
    },
    teamSize: {
        type: Number,
        min: 1,
        max: 1000,
    },
    games: [
        {
            type: String,
            trim: true,
        },
    ],
    achievements: [
        {
            type: String,
            trim: true,
            maxlength: 200,
        },
    ],
    socialMedia: {
        facebook: {
            type: String,
            trim: true,
        },
        twitter: {
            type: String,
            trim: true,
        },
        instagram: {
            type: String,
            trim: true,
        },
        youtube: {
            type: String,
            trim: true,
        },
        twitch: {
            type: String,
            trim: true,
        },
    },
    contactInfo: {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
            maxlength: 200,
        },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
organizationProfileSchema.index({ organizationName: 1 });
organizationProfileSchema.index({ isActive: 1, isVerified: 1 });
const OrganizationProfile = mongoose_1.default.model("OrganizationProfile", organizationProfileSchema);
exports.default = OrganizationProfile;
