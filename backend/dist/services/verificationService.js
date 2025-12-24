"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const crypto_1 = __importDefault(require("crypto"));
class VerificationService {
    static generateVerificationCode() {
        return crypto_1.default.randomBytes(3).toString("hex").toUpperCase();
    }
    static async getPlayerInfoFromStore(standoff2Id) {
        try {
            const api = "https://store.standoff2.com/api";
            const response = await fetch(`${api}/v2/accounts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
                },
                body: JSON.stringify({ uid: standoff2Id })
            });
            if (!response.ok) {
                const data = await response.json();
                return {
                    success: false,
                    error: data.message || `Store API returned ${response.status}`,
                };
            }
            const data = await response.json();
            if (data && data.nick) {
                return {
                    success: true,
                    nickname: data.nick,
                    avatar: data.avatar,
                };
            }
            else {
                return {
                    success: false,
                    error: "Player not found on Standoff 2 store",
                };
            }
        }
        catch (error) {
            console.error("Store API Error:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to connect to Standoff 2 store",
            };
        }
    }
    static async verifyNicknameMatch(standoff2Id, expectedNickname) {
        const result = await this.getPlayerInfoFromStore(standoff2Id);
        if (!result.success)
            return result;
        const isMatch = result.nickname?.trim().toLowerCase() === expectedNickname.trim().toLowerCase();
        return {
            success: isMatch,
            nickname: result.nickname,
            avatar: result.avatar,
            error: isMatch ? undefined : `Nickname mismatch. Expected: "${expectedNickname}", Found: "${result.nickname}"`
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
