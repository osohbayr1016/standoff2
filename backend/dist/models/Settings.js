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
const settingsSchema = new mongoose_1.Schema({
    siteName: {
        type: String,
        default: "E-Sport Connection",
        trim: true,
        maxlength: 100,
    },
    siteDescription: {
        type: String,
        default: "Connect with esports players and organizations",
        trim: true,
        maxlength: 500,
    },
    contactEmail: {
        type: String,
        default: "admin@esport-connection.com",
        trim: true,
        lowercase: true,
    },
    maintenanceMode: {
        type: Boolean,
        default: false,
    },
    requireEmailVerification: {
        type: Boolean,
        default: true,
    },
    allowRegistration: {
        type: Boolean,
        default: true,
    },
    maxLoginAttempts: {
        type: Number,
        default: 5,
        min: 3,
        max: 10,
    },
    sessionTimeout: {
        type: Number,
        default: 24,
        min: 1,
        max: 168,
    },
    emailNotifications: {
        type: Boolean,
        default: true,
    },
    pushNotifications: {
        type: Boolean,
        default: true,
    },
    adminAlerts: {
        type: Boolean,
        default: true,
    },
    theme: {
        type: String,
        enum: ["dark", "light", "auto"],
        default: "dark",
    },
    primaryColor: {
        type: String,
        default: "#3B82F6",
        match: /^#[0-9A-Fa-f]{6}$/,
    },
    accentColor: {
        type: String,
        default: "#06B6D4",
        match: /^#[0-9A-Fa-f]{6}$/,
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model("Settings", settingsSchema);
