import { FastifyInstance, FastifyPluginAsync } from "fastify";
import jwt from "jsonwebtoken";
import PlayerProfile from "../models/PlayerProfile";
import { VerificationService } from "../services/verificationService";

const verificationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
    // Request verification code
    fastify.post("/request", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({ success: false, message: "Authentication required" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const profile = await PlayerProfile.findOne({ userId: decoded.id });

            if (!profile) {
                return reply.status(404).send({ success: false, message: "Player profile not found" });
            }

            const { standoff2Id } = request.body as { standoff2Id: string };
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
        } catch (error) {
            console.error("Verification Request Error:", error);
            return reply.status(500).send({ success: false, message: "Failed to register Standoff 2 ID" });
        }
    });

    // Verify code on store
    fastify.post("/verify", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({ success: false, message: "Authentication required" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const profile = await PlayerProfile.findOne({ userId: decoded.id });

            if (!profile || !profile.standoff2Id) {
                return reply.status(400).send({ success: false, message: "Please register your Standoff 2 ID first" });
            }

            const result = await VerificationService.verifyNicknameMatch(
                profile.standoff2Id,
                profile.inGameName
            );

            if (result.success) {
                profile.isIdVerified = true;
                // Update avatar from store if available
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
            } else {
                return reply.status(400).send({
                    success: false,
                    message: result.error || "Verification failed. Make sure your website nickname matches your in-game nickname.",
                });
            }
        } catch (error) {
            console.error("Verification Execution Error:", error);
            return reply.status(500).send({ success: false, message: "An error occurred during verification" });
        }
    });
};

export default verificationRoutes;
