"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const PlayerProfile_1 = __importDefault(require("../models/PlayerProfile"));
const verificationService_1 = require("../services/verificationService");
const verificationRoutes = async (fastify) => {
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const verificationService_1 = require("../services/verificationService");
const verificationRoutes = async (fastify) => {
    await fastify.register(rate_limit_1.default, {
        max: 3,
        timeWindow: '5 minute',
        errorResponseBuilder: (request, context) => ({
            success: false,
            message: "Too many verification requests. Please wait a few minutes."
        })
    });
    fastify.post("/request", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({ success: false, message: "Authentication required" });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const profile = await PlayerProfile_1.default.findOne({ userId: decoded.id });
            if (!profile) {
                return reply.status(404).send({ success: false, message: "Player profile not found" });
            }
            const { standoff2Id } = request.body;
            if (!standoff2Id) {
                return reply.status(400).send({ success: false, message: "Standoff 2 ID is required" });
            }
            profile.standoff2Id = standoff2Id;
            profile.isIdVerified = false;
            await profile.save();
            return reply.send({
                success: true,
                message: "Standoff 2 ID registered. Now, ensure your profile nickname matches your in-game nickname.",
            });
        }
        catch (error) {
            console.error("Verification Request Error:", error);
            return reply.status(500).send({ success: false, message: "Failed to register Standoff 2 ID" });
            const result = await verificationService_1.VerificationService.requestVerification(decoded.id, standoff2Id);
            if (result.success) {
                return reply.send({
                    success: true,
                    message: result.message,
                    status: result.status
                });
            }
            else {
                return reply.status(400).send({ success: false, message: result.message });
            }
        }
        catch (error) {
            console.error("Verification Request Error:", error);
            return reply.status(500).send({ success: false, message: "Failed to submit verification request" });
        }
    });
    fastify.post("/verify", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({ success: false, message: "Authentication required" });
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const profile = await PlayerProfile_1.default.findOne({ userId: decoded.id });
            if (!profile || !profile.standoff2Id) {
                return reply.status(400).send({ success: false, message: "Please register your Standoff 2 ID first" });
            }
            const result = await verificationService_1.VerificationService.verifyNicknameMatch(profile.standoff2Id, profile.inGameName);
            if (result.success) {
                profile.isIdVerified = true;
                if (result.avatar) {
                    profile.avatar = result.avatar;
                }
                await profile.save();
                return reply.send({
                    success: true,
                    message: "Account verified successfully! Your avatar has been updated.",
                    nickname: result.nickname,
                    avatar: result.avatar
                });
            }
            else {
                return reply.status(400).send({
                    success: false,
                    message: result.error || "Verification failed. Make sure your website nickname matches your in-game nickname.",
            const statusData = await verificationService_1.VerificationService.getVerificationStatus(decoded.id);
            if (statusData.status === "VERIFIED") {
                return reply.send({
                    success: true,
                    message: "Account is verified.",
                    isVerified: true
                });
            }
            else {
                return reply.send({
                    success: false,
                    message: `Verification status: ${statusData.status}. Please wait for admin approval.`,
                    status: statusData.status
                });
            }
        }
        catch (error) {
            console.error("Verification Execution Error:", error);
            return reply.status(500).send({ success: false, message: "An error occurred during verification" });
            console.error("Verification Status Check Error:", error);
            return reply.status(500).send({ success: false, message: "An error occurred checking status" });
        }
    });
};
exports.default = verificationRoutes;
