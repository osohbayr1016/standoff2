import { FastifyInstance, FastifyPluginAsync } from "fastify";
import jwt from "jsonwebtoken";
import rateLimit from "@fastify/rate-limit"; // Import rate limit
import PlayerProfile from "../models/PlayerProfile";
import { VerificationService } from "../services/verificationService";

const verificationRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {

    // Register rate limit specifically for this plugin context if possible, 
    // or just use the config object in the route definition if the plugin is global.
    // Assuming local registration for this scope:
    await fastify.register(rateLimit, {
        max: 3, // 3 requests
        timeWindow: '5 minute', // per 5 minutes
        errorResponseBuilder: (request, context) => ({
            success: false,
            message: "Too many verification requests. Please wait a few minutes."
        })
    });

    // Request verification (Manual Submission)
    fastify.post("/request", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({ success: false, message: "Authentication required" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const { standoff2Id } = request.body as { standoff2Id: string };

            if (!standoff2Id) {
                return reply.status(400).send({ success: false, message: "Standoff 2 ID is required" });
            }

            const result = await VerificationService.requestVerification(decoded.id, standoff2Id);

            if (result.success) {
                return reply.send({
                    success: true,
                    message: result.message,
                    status: result.status
                });
            } else {
                return reply.status(400).send({ success: false, message: result.message });
            }

        } catch (error) {
            console.error("Verification Request Error:", error);
            return reply.status(500).send({ success: false, message: "Failed to submit verification request" });
        }
    });

    // Verify / Check Status (No longer triggers external API)
    fastify.post("/verify", async (request, reply) => {
        try {
            const token = request.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return reply.status(401).send({ success: false, message: "Authentication required" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
            const statusData = await VerificationService.getVerificationStatus(decoded.id);

            if (statusData.status === "VERIFIED") {
                return reply.send({
                    success: true,
                    message: "Account is verified.",
                    isVerified: true
                });
            } else {
                return reply.send({
                    success: false, // Not fully verified yet
                    message: `Verification status: ${statusData.status}. Please wait for admin approval.`,
                    status: statusData.status
                });
            }

        } catch (error) {
            console.error("Verification Status Check Error:", error);
            return reply.status(500).send({ success: false, message: "An error occurred checking status" });
        }
    });
};

export default verificationRoutes;
