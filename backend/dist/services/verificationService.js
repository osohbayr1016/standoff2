"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
class VerificationService {
    static async requestVerification(userId, standoff2Id) {
        try {
            const profile = await PlayerProfile_1.default.findOne({ userId });
            if (!profile) {
                return { success: false, message: "Profile not found.", status: "error" };
            }
            if (profile.verificationStatus === "VERIFIED") {
                return { success: true, message: "User is already verified.", status: "VERIFIED" };
            }
            profile.standoff2Id = standoff2Id;
            profile.verificationStatus = "PENDING";
            profile.isIdVerified = false;
            await profile.save();
            return {
                success: true,
                message: "Verification request submitted successfully. Please wait for admin approval.",
                status: "PENDING"
            };
        }
        catch (error) {
            console.error("Manual Verification Request Error:", error);
            return { success: false, message: "Internal server error.", status: "error" };
        }
    }
    static async approveVerification(userId) {
        try {
            const profile = await PlayerProfile_1.default.findOne({ userId });
            if (!profile)
                return { success: false, message: "Profile not found." };
            if (profile.verificationStatus !== "PENDING" && profile.verificationStatus !== "REJECTED" && profile.verificationStatus !== "UNVERIFIED") {
                return { success: false, message: "User is already verified or in invalid state." };
            }
            profile.verificationStatus = "VERIFIED";
            profile.isIdVerified = true;
            await profile.save();
            return { success: true, message: "User successfully verified." };
        }
        catch (error) {
            console.error("Approve Verification Error:", error);
            return { success: false, message: "Internal server error." };
        }
    }
    static async rejectVerification(userId, reason) {
        try {
            const profile = await PlayerProfile_1.default.findOne({ userId });
            if (!profile)
                return { success: false, message: "Profile not found." };
            profile.verificationStatus = "REJECTED";
            profile.isIdVerified = false;
            await profile.save();
            return { success: true, message: "User verification rejected." };
        }
        catch (error) {
            console.error("Reject Verification Error:", error);
            return { success: false, message: "Internal server error." };
        }
    }
    static async getVerificationStatus(userId) {
        const profile = await PlayerProfile_1.default.findOne({ userId }).select("verificationStatus standoff2Id");
        return {
            status: profile?.verificationStatus || "UNVERIFIED",
            standoff2Id: profile?.standoff2Id
        };
    }
}
exports.VerificationService = VerificationService;
exports.default = VerificationService;
